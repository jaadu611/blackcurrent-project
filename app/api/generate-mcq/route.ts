import { NextResponse } from "next/server";
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import os from "os";
import { automateNotebookLM } from "@/lib/notebooklmAutomator";
import { SYSTEM_PROMPT } from "@/lib/prompts";

const NOTEBOOK_TITLE_PREFIX = "MCQ Generator Session";

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "notebooklm-"));
  
  try {
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(path.join(uploadDir, file.name), buffer);
    }

    const browser = await chromium.connectOverCDP("http://localhost:9222");
    const context = browser.contexts()[0];
    const page = await context.newPage();

    const notebookTitle = `${NOTEBOOK_TITLE_PREFIX} - ${Date.now()}`;
    
    try {
      const result = await automateNotebookLM(page, uploadDir, SYSTEM_PROMPT, notebookTitle);
      return NextResponse.json({ text: result });
    } finally {
      await page.close();
      // Note: We don't close the browser connection here if we want to reuse the browser
      // await browser.close(); 
    }
  } catch (error: any) {
    console.error("[API generate-mcq] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    try {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    } catch (e) {
      console.warn("[API generate-mcq] Failed to cleanup uploadDir:", e);
    }
  }
}
