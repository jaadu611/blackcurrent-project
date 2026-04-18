import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Quiz from "@/models/Quiz";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const { id } = params;
        const quiz = await Quiz.findById(id);

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        // Return structured JSON for ESP32 consumption
        return NextResponse.json({
            id: quiz._id,
            title: quiz.title,
            questions: quiz.questions.map((q: any, index: number) => ({
                index,
                question: q.question,
                options: q.options,
                // We don't send the answer to the ESP32 to prevent cheating, 
                // unless explicitly needed for offline validation.
                // For now, we only send the question and options.
            })),
        });
    } catch (error: any) {
        console.error("[API quiz] Error:", error);
        return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
    }
}
