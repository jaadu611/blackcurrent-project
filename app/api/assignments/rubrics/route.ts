import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Rubric from "@/models/Rubric";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const teacherId = cookieStore.get("teacher_id")?.value;

    if (!teacherId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    let rubric = await Rubric.findOne({ teacherId });

    if (!rubric) {
      // Create a default one if it doesn't exist
      rubric = await Rubric.create({ teacherId, constraints: "" });
    }

    return NextResponse.json(rubric);
  } catch (error: any) {
    console.error("[API Rubrics GET] Error:", error);
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

    const { constraints, referenceDocuments } = await req.json();

    await connectToDatabase();
    const rubric = await Rubric.findOneAndUpdate(
      { teacherId },
      { constraints, referenceDocuments },
      { new: true, upsert: true }
    );

    return NextResponse.json(rubric);
  } catch (error: any) {
    console.error("[API Rubrics POST] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
