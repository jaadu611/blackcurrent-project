import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Submission from "@/models/Submission";
import Student from "@/models/Student";
import Quiz from "@/models/Quiz";

export async function GET() {
    try {
        await connectToDatabase();
        
        // Fetch submissions and populate related data
        const submissions = await Submission.find()
            .populate({ path: 'studentId', model: Student })
            .populate({ path: 'quizId', model: Quiz })
            .sort({ createdAt: -1 });

        return NextResponse.json(submissions);
    } catch (error: any) {
        console.error("[GET /api/submissions] Error:", error);
        return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }
}
