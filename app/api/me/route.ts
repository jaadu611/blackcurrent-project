import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import Teacher from "../../../models/Teacher";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const teacherId = cookieStore.get("teacher_id")?.value;

    if (!teacherId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();

    const teacher = await Teacher.findById(teacherId).select("-password");
    if (!teacher) {
       // Clear invalid cookie
       cookieStore.delete("teacher_id");
       return NextResponse.json({ error: "Teacher not found" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: teacher._id.toString(),
        fullName: teacher.fullName,
        institute: teacher.institute,
        email: teacher.email
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Me API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
