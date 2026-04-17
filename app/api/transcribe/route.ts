import { NextResponse } from "next/server";
import { run } from "@/lib/assemblyAI";
import path from "path";

export async function POST(req: Request) {
  try {
    // For now, hardcode the path to the project root's test-audio.mp3
    // In the future, this would receive the generated mp3 file from the frontend
    const audioPath = path.join(process.cwd(), "test-audio.mp3");
    
    const text = await run(audioPath);
    
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Transcription API error:", error);
    return NextResponse.json({ error: error.message || "Failed to transcribe" }, { status: 500 });
  }
}
