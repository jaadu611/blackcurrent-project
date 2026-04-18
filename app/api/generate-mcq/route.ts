import { NextResponse } from "next/server";
import { chromium } from "playwright";
import connectToDatabase from "@/lib/mongodb";
import path from "path";
import fs from "fs";
import os from "os";
import { automateNotebookLM } from "@/lib/notebooklmAutomator";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import Quiz from "@/models/Quiz";

export async function POST(req: Request) {
  let tempDir = "";
  let browser: any = null;

  try {
    await connectToDatabase();
    const formData = await req.formData();

    // ── KEY FIX: getAll() collects every "pdf" entry, not just the first ──
    const files = formData.getAll("pdf") as File[];
    const rollNumber = (formData.get("rollNumber") as string) || "admin";
    const quizTitle =
      (formData.get("title") as string) || `Quiz Pool - ${Date.now()}`;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 },
      );
    }

    console.log(
      `[API generate-mcq] Starting automation for roll: ${rollNumber} | files: ${files.map((f) => f.name).join(", ")}`,
    );

    // 1. Save ALL PDFs into the same temp directory
    tempDir = path.join(os.tmpdir(), `notebooklm_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(path.join(tempDir, file.name), buffer);
      console.log(`[API] Saved: ${file.name}`);
    }

    // 2. Connect to existing Brave instance, or launch a new one
    try {
      browser = await chromium.connectOverCDP("http://localhost:9222");
      console.log("[API] Connected to existing Brave instance on port 9222");
    } catch {
      console.warn(
        "[API] Could not connect to Brave on port 9222. Launching new instance...",
      );
      const userDataDir = path.join(os.homedir(), ".playwright-notebooklm");
      browser = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1280, height: 720 },
      });
    }

    const context = browser.contexts ? browser.contexts()[0] : (browser as any);
    const page = await context.newPage();

    // 3. Run Automation — tempDir now contains ALL uploaded PDFs
    const notebookTitle = `Pool_${rollNumber}_${Date.now()}`;
    const rawResult = await automateNotebookLM(
      page,
      tempDir,
      SYSTEM_PROMPT,
      notebookTitle,
    );

    // 4. Parse JSON result
    let questionsPool: any[] = [];
    try {
      // Clean the raw result: remove markdown blocks and whitespace
      let cleaned = rawResult.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```/, "").replace(/```$/, "");
      }

      // Try to find the array if it's embedded in other text
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : cleaned;

      try {
        questionsPool = JSON.parse(jsonStr);
      } catch (parseErr) {
        // Fallback: try to fix common JSON errors (like trailing commas or unescaped quotes)
        // But for now, let's try a simpler fix: checking if the JSON was cut off
        if (jsonStr.lastIndexOf("}") < jsonStr.lastIndexOf(",")) {
          // likely cut off or has trailing comma
          const fixedStr = jsonStr.substring(0, jsonStr.lastIndexOf("}") + 1) + "]";
          questionsPool = JSON.parse(fixedStr);
        } else {
          throw parseErr;
        }
      }
    } catch (e) {
      console.error("[API] JSON Parse Error. Raw result:", rawResult);
      throw new Error("AI returned invalid JSON format. Please try again.");
    }

    // 5. Save to MongoDB
    const newQuiz = await Quiz.create({
      teacherId: new (require("mongoose").Types.ObjectId)(),
      title: quizTitle,
      questions: questionsPool.map((q: any) => ({
        ...q,
        usageCount: 0,
        lastUsedIndex: -1,
      })),
      status: "published",
      rawContent: rawResult,
    });

    console.log(
      `[API] Created quiz pool with ${questionsPool.length} questions. ID: ${newQuiz._id}`,
    );

    // 6. Select questions for this user
    const {
      selectQuestionsForQuiz,
      markQuestionsUsed,
    } = require("@/lib/quizSelector");
    const { questions: selectedQuestions, currentIndex } =
      await selectQuestionsForQuiz(newQuiz._id.toString(), rollNumber);

    const poolIndices = selectedQuestions.map((q: any) => q.poolIndex);
    await markQuestionsUsed(newQuiz._id.toString(), poolIndices, currentIndex);

    // 7. Push to ESP32 in background
    const STATION_IP = process.env.STATION_IP || "10.30.233.98";
    const quizPayload = {
      _id: newQuiz._id.toString(),
      id: newQuiz._id.toString(),
      quizId: newQuiz._id.toString(),
      title: newQuiz.title,
      questions: selectedQuestions
    };

    fetch(`http://${STATION_IP}/api/load_questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizPayload),
    })
      .then((r) =>
        r.ok
          ? console.log(`[API] Synced database-backed quiz (${newQuiz._id}) to ESP32`)
          : console.error("[API] ESP32 error:", r.status),
      )
      .catch((e) => console.warn("[API] ESP32 unreachable:", e.message));

    return NextResponse.json({
      success: true,
      quizId: newQuiz._id,
      questions: selectedQuestions,
      rawResult, // Add this
    });
  } catch (error: any) {
    console.error("[API generate-mcq] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (browser) {
      if (browser.isConnected && browser.isConnected()) {
        await browser.close().catch(() => { });
      }
    }
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
