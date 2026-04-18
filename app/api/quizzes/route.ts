import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const cookieStore = await cookies();
        const teacherId = cookieStore.get("teacher_id")?.value;

        if (!teacherId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await request.json();

        // Directly create the quiz from the payload, injecting teacherId
        const newQuiz = new Quiz({
            ...body,
            teacherId,
            // Default to published if not provided
            status: body.status || "published",
        });

        await newQuiz.save();

        // Push to ESP32 Station if available
        const STATION_IP = process.env.STATION_IP || "10.30.233.98";
        const espUrl = `http://${STATION_IP}/api/load_questions`;

        console.log(`[PUSH] Attempting to push new quiz to ESP at: ${espUrl}`);

        // Prepare payload in web-native format
        const quizPayload = {
            _id: newQuiz._id.toString(),
            id: newQuiz._id.toString(),
            quizId: newQuiz._id.toString(),
            title: newQuiz.title,
            questions: newQuiz.questions.map((q: any) => ({
                type: q.type,
                question: q.question,
                options: q.options.map((opt: any) => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    followUp: opt.followUp || null
                })),
                answer: q.answer || null
            }))
        };

        // Non-blocking fire-and-forget push
        fetch(espUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(quizPayload),
        }).then(res => {
            if (res.ok) console.log("[PUSH] Successfully synced quiz to ESP32");
            else console.error("[PUSH] ESP32 returned error:", res.status);
        }).catch(err => {
            console.warn("[PUSH] Could not reach ESP32 station:", err.message);
        });

        return NextResponse.json({
            message: "Quiz created and push initiated to ESP32",
            quizId: newQuiz._id,
        }, { status: 201 });

    } catch (error: any) {
        console.error("[POST /api/quizzes] Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create quiz" }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectToDatabase();
        const quizzes = await Quiz.find().sort({ createdAt: -1 });
        return NextResponse.json(quizzes);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
    }
}
