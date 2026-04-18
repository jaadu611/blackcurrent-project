import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import Teacher from "@/models/Teacher";

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Ensure we have a teacher to associate the quiz with
        let teacher = await Teacher.findOne();
        if (!teacher) {
            // Fallback: create a dummy teacher if none exists
            teacher = await Teacher.create({
                fullName: "System Debugger",
                email: "debug@system.local",
                password: "debug_password_123",
                institute: "Debug Lab",
                number: "0000000000"
            });
        }

        const debugQuestions = [
            {
                "type": "mcq",
                "question": "An improper integral where both limits are finite, but the integrand has an infinite discontinuity between them, is classified as which type?",
                "options": [
                    { "text": "A) Type I", "isCorrect": false, "followUp": { "type": "voice", "question": "What characteristic of the integration limits actually defines a Type I improper integral?" } },
                    { "text": "B) Type II", "isCorrect": true, "followUp": null },
                    { "text": "C) Type III", "isCorrect": false, "followUp": null },
                    { "text": "D) Mixed Kind", "isCorrect": false, "followUp": null }
                ]
            },
            {
                "type": "mcq",
                "question": "The Gamma function is also known by what other name?",
                "options": [
                    { "text": "A) Euler's integral of the first kind", "isCorrect": false, "followUp": { "type": "voice", "question": "You selected the first kind. Which distinct mathematical function is actually associated with Euler's integral of the first kind?" } },
                    { "text": "B) Euler's integral of the second kind", "isCorrect": true, "followUp": null },
                    { "text": "C) Cauchy's principal integral", "isCorrect": false, "followUp": null },
                    { "text": "D) Duplication integral", "isCorrect": false, "followUp": null }
                ]
            },
            {
                "type": "numeric",
                "question": "Based on the formula Gamma(n+1) = n!, what is the evaluated value of Gamma(3)?",
                "answer": 2,
                "followUp": {
                    "type": "numeric",
                    "question": "Using the same logic, what is the value of Gamma(4)?",
                    "answer": 6
                }
            },
            {
                "type": "voice",
                "question": "Explain the fundamental difference between an Improper Integral of Type I and an Improper Integral of Type II.",
                "followUp": {
                    "type": "voice",
                    "question": "How does a Type III improper integral build upon the characteristics of Type I and Type II?"
                }
            }
        ];

        // 2. Upsert the Debug Quiz in MongoDB
        const quiz = await Quiz.findOneAndUpdate(
            { title: "SYSTEM_DEBUG_QUIZ" },
            {
                teacherId: teacher._id,
                title: "SYSTEM_DEBUG_QUIZ",
                questions: debugQuestions,
                status: "published",
                difficulty: "hard"
            },
            { upsert: true, new: true }
        );

        // 3. Prepare the wrapped payload for the ESP32 (covering all possible ID keys)
        const quizPayload = {
            _id: quiz._id.toString(),
            id: quiz._id.toString(),
            quizId: quiz._id.toString(),
            title: "Debug Exam (Hardcoded)",
            questions: quiz.questions.map((q: any) => ({
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

        const STATION_IP = process.env.STATION_IP || "10.30.233.98";
        const espUrl = `http://${STATION_IP}/api/load_questions`;

        console.log(`[DEBUG-PUSH] Syncing database-backed quiz (${quiz._id}) to ESP at: ${espUrl}`);

        const resp = await fetch(espUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(quizPayload),
            signal: AbortSignal.timeout(10000),
        });

        if (resp.ok) {
            return NextResponse.json({
                message: "Successfully pushed database-backed debug quiz to ESP32",
                quizId: quiz._id.toString()
            });
        } else {
            return NextResponse.json({ error: "ESP32 rejected the push", status: resp.status }, { status: 502 });
        }
    } catch (err: any) {
        console.error("[DEBUG-PUSH] Error:", err);
        return NextResponse.json({ error: "Debug push failed", details: err.message }, { status: 500 });
    }
}
