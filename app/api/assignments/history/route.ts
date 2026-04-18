import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import GradingHistory from "@/models/GradingHistory";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const teacherId = cookieStore.get("teacher_id")?.value;

    if (!teacherId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const history = await GradingHistory.find({ teacherId }).sort({ createdAt: -1 });

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("[API History GET] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const teacherId = cookieStore.get("teacher_id")?.value;

    if (!teacherId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentName, assignmentTitle, score, rawOutput } = await req.json();

    if (!studentName || !assignmentTitle || !rawOutput) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const newRecord = await GradingHistory.create({
      teacherId,
      studentName,
      assignmentTitle,
      score,
      rawOutput,
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    console.error("[API History POST] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
