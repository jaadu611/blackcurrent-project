import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      console.error("API Key missing in environment variables.");
      return NextResponse.json({ error: "API Key missing in environment" }, { status: 500 });
    }

    // The correct endpoint for generating temporary tokens for AssemblyAI Streaming
    const response = await fetch("https://streaming.assemblyai.com/v3/token?expires_in_seconds=600", {
      method: "GET",
      headers: {
        "Authorization": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AssemblyAI Token Error Response:", errorText);
      return NextResponse.json(
        { error: "Failed to generate token", detail: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Token generation exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
