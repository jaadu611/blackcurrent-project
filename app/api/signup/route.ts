import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import Teacher from "../../../models/Teacher";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { fullName, number, institute, email, password } = await request.json();

    if (!fullName || !number || !institute || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return NextResponse.json(
        { error: "A teacher with this email already exists" },
        { status: 400 }
      );
    }

    // Create new teacher
    const newTeacher = await Teacher.create({
      fullName,
      number,
      institute,
      email,
      password,
    });

    // Set simple cookie
    const cookieStore = await cookies();
    cookieStore.set("teacher_id", newTeacher._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json(
      { message: "Teacher registered successfully", teacherId: newTeacher._id, user: { fullName: newTeacher.fullName, institute: newTeacher.institute } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to register teacher" },
      { status: 500 }
    );
  }
}
