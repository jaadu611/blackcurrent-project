import { NextResponse } from "next/server";
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import os from "os";
import { automateNotebookLM } from "@/lib/notebooklmAutomator";
import connectToDatabase from "@/lib/mongodb";
import GradingHistory from "@/models/GradingHistory";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const formData = await req.formData();
  
  // Get Rubric Files (Max 9)
  const rubricFiles = formData.getAll("rubricFiles") as File[];
  // Get Student Files
  const studentFiles = formData.getAll("studentFiles") as File[];
  // Custom Prompt
  const customPrompt = (formData.get("prompt") as string) || "Grade these assignments based on the provided rubrics.";
  // Metadata
  const topic = (formData.get("topic") as string) || "General Assessment";
  const date = (formData.get("date") as string) || new Date().toISOString();

  if (rubricFiles.length === 0 || studentFiles.length === 0) {
    return NextResponse.json({ error: "Rubrics and student files are both required." }, { status: 400 });
  }

  if (rubricFiles.length > 9) {
    return NextResponse.json({ error: "Maximum of 9 rubric files allowed." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const teacherId = cookieStore.get("teacher_id")?.value;

  if (!teacherId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create a single shared temp directory for all files in this session
  const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "autograder-"));
  
  try {
    // Save Rubrics
    for (const file of rubricFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(path.join(uploadDir, `RUBRIC_${file.name}`), buffer);
    }

    // Save Student Assignments
    for (const file of studentFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(path.join(uploadDir, `STUDENT_${file.name}`), buffer);
    }

    // Connect to local browser via CDP
    const browser = await chromium.connectOverCDP("http://localhost:9222");
    const context = browser.contexts()[0];
    const page = await context.newPage();

    const notebookTitle = `Autograder: ${topic} (${date})`;
    
    try {
      // Orchestrate NotebookLM
      const result = await automateNotebookLM(page, uploadDir, customPrompt, notebookTitle);
      
      // Save to History (Using the first student file as representative or a batch entry)
      await connectToDatabase();
      await GradingHistory.create({
        teacherId,
        studentName: `Batch: ${studentFiles.length} Students`,
        assignmentTitle: topic,
        score: 0, 
        rawOutput: result,
      });

      return NextResponse.json({ 
        success: true,
        topic,
        result 
      });
    } finally {
      await page.close();
    }
  } catch (error: any) {
    console.error("[API autograder] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    try {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    } catch (e) {
      console.warn("[API autograder] Failed to cleanup uploadDir:", e);
    }
  }
}
