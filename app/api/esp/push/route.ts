import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { data, espIp, endpoint = "/api/load_questions" } = await req.json();

    if (!data || !espIp) {
      return NextResponse.json(
        { error: "Missing 'data' or 'espIp'" },
        { status: 400 },
      );
    }

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const espUrl = `http://${espIp}${cleanEndpoint}`;
    console.log("[ESP-PUSH] Forwarding to:", espUrl);

    const espResponse = await fetch(espUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
      signal: AbortSignal.timeout(8000),
    });

    const responseText = await espResponse.text();

    if (!espResponse.ok) {
      return NextResponse.json(
        {
          error: `ESP32 responded with ${espResponse.status}: ${responseText}`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, espResponse: responseText });
  } catch (error: any) {
    console.error("[ESP-PUSH] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reach ESP32" },
      { status: 500 },
    );
  }
}
