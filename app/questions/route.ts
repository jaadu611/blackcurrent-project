import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import { selectQuestionsForQuiz, markQuestionsUsed } from "@/lib/quizSelector";

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const quizId = searchParams.get("quizId");
        const rollNumber = searchParams.get("rollNumber") || "anonymous";

        if (!quizId) {
            // Fallback to a default quiz if no quizId provided (for testing)
            const defaultQuiz = await Quiz.findOne({ status: "published" });
            if (!defaultQuiz) {
                return NextResponse.json({ error: "No published quizzes found" }, { status: 404 });
            }
            return NextResponse.json(defaultQuiz.questions.slice(0, 10));
        }

        // Selection Logic
        const { questions, currentIndex } = await selectQuestionsForQuiz(quizId, rollNumber);
        
        // Update metadata
        const poolIndices = questions.map((q: any) => q.poolIndex);
        await markQuestionsUsed(quizId, poolIndices, currentIndex);

        return NextResponse.json(questions);
    } catch (error: any) {
        console.error("[GET /questions] Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
