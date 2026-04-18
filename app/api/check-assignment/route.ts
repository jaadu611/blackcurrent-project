import { NextResponse } from "next/server";
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import os from "os";
import { automateNotebookLM } from "@/lib/notebooklmAutomator";
import { ASSIGNMENT_CHECK_PROMPT } from "@/lib/prompts";
import connectToDatabase from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  let tempDir = "";
  let browser: any = null;

  try {
    await connectToDatabase();
    
    const cookieStore = await cookies();
    const teacherId = cookieStore.get("teacher_id")?.value || "admin";

    const formData = await req.formData();
    const studentName = formData.get("studentName") as string;
    const rollNumber = formData.get("rollNumber") as string;
    const title = formData.get("title") as string;

    if (!studentName || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create temp directory and save all files
    tempDir = path.join(os.tmpdir(), `grading_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        // For student submissions, prefix with "STUDENT_" to help AI distinguish
        const prefix = key.startsWith("student_") ? "STUDENT_SUBMISSION_" : "SOURCE_";
        const fileName = `${prefix}${value.name}`;
        const filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, buffer);
      }
    }

    // 2. Launch Browser
    const userDataDir = path.join(os.homedir(), ".playwright-notebooklm");
    browser = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      viewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();
    
    // 3. Run Automation
    const notebookTitle = `Grading_${rollNumber}_${Date.now()}`;
    const rawResult = await automateNotebookLM(
      page,
      tempDir,
      ASSIGNMENT_CHECK_PROMPT,
      notebookTitle
    );

    // 4. Parse result
    let gradingResult: any;
    try {
      const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : rawResult;
      gradingResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error("[API] JSON Parse Error. Raw result:", rawResult);
      throw new Error("AI returned invalid JSON grading report.");
    }

    // 5. Save to MongoDB
    const assignment = await Assignment.create({
      teacherId,
      studentName,
      rollNumber,
      title,
      grade: gradingResult.grade,
      overallFeedback: gradingResult.overallFeedback,
      detailedReviews: gradingResult.detailedReviews,
      status: "completed",
    });

    return NextResponse.json(assignment);

  } catch (error: any) {
    console.error("[API check-assignment] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (browser) await browser.close();
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
