import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";
import path from "path";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY as string,
});

export async function POST() {
  try {
    const audioPath = path.join(process.cwd(), "test-audio.mp3");
    
    const transcript = await client.transcripts.transcribe({
      audio: audioPath,
      language_detection: true,
      speech_models: ["universal-3-pro", "universal-2"],
    });

    return NextResponse.json({ text: transcript.text });
  } catch (error: any) {
    console.error("[API transcribe] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
