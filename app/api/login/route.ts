import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import Teacher from "../../../models/Teacher";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, teacher.password);
    if (!passwordsMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set simple cookie
    const cookieStore = await cookies();
    cookieStore.set("teacher_id", teacher._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json(
      { message: "Logged in successfully", user: { fullName: teacher.fullName, institute: teacher.institute } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
