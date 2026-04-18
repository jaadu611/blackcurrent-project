import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import Teacher from "../../../models/Teacher";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // --- Fast path: read user from session cookie (no DB needed) ---
    const sessionCookie = cookieStore.get("teacher_session")?.value;
    if (sessionCookie) {
      try {
        const decoded = Buffer.from(sessionCookie, "base64").toString("utf-8");
        const user = JSON.parse(decoded);
        if (user?.id && user?.fullName) {
          return NextResponse.json({ user }, { status: 200 });
        }
      } catch {
        // If the session cookie is malformed, fall through to DB lookup
      }
    }

    // --- Slow path: look up user in the database ---
    const teacherId = cookieStore.get("teacher_id")?.value;
    if (!teacherId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();
    const teacher = await Teacher.findById(teacherId).select("-password");

    if (!teacher) {
      cookieStore.delete("teacher_id");
      cookieStore.delete("teacher_session");
      return NextResponse.json({ error: "Teacher not found" }, { status: 401 });
    }

    const user = {
      id: teacher._id.toString(),
      fullName: teacher.fullName,
      institute: teacher.institute,
      email: teacher.email,
    };

    // Backfill the session cookie for next time
    const encoded = Buffer.from(JSON.stringify(user)).toString("base64");
    cookieStore.set("teacher_session", encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error("Me API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
