import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Log the incoming data as requested
        console.log("[POST /submit] Data received from ESP32:", data);

        return NextResponse.json({
            message: "Data received successfully",
            received: data
        }, { status: 200 });
    } catch (error: any) {
        console.error("[POST /submit] Error:", error);

        // Fallback for non-JSON or other errors
        return NextResponse.json({
            error: "Failed to process submission",
            message: error.message
        }, { status: 400 });
    }
}
