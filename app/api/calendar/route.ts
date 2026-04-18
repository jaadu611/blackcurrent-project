import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Deliverable from "@/models/Deliverable";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const teacherId = cookieStore.get("teacher_id")?.value;

    if (!teacherId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const deliverables = await Deliverable.find({ teacherId }).sort({ dueDate: 1 });

    return NextResponse.json(deliverables);
  } catch (error: any) {
    console.error("[API Calendar GET] Error:", error);
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

    const { title, dueDate, type } = await req.json();

    if (!title || !dueDate || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const newDeliverable = await Deliverable.create({
      teacherId,
      title,
      dueDate: new Date(dueDate),
      type,
    });

    return NextResponse.json(newDeliverable, { status: 201 });
  } catch (error: any) {
    console.error("[API Calendar POST] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const teacherId = cookieStore.get("teacher_id")?.value;

    if (!teacherId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await connectToDatabase();
    await Deliverable.deleteOne({ _id: id, teacherId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Calendar DELETE] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
