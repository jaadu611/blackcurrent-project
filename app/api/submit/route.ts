import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import Submission from "@/models/Submission";
import Student from "@/models/Student";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const formData = await request.formData();
        const rollNumber = formData.get("rollNumber") as string;
        const quizId = formData.get("quizId") as string;
        const answersStr = formData.get("answers") as string;
        const audioFile = formData.get("audio") as File | null;

        if (!rollNumber || !quizId || !answersStr) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const answers = JSON.parse(answersStr);

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        let score = 0;
        const processedAnswers = quiz.questions.map((q: any, idx: number) => {
            const userAnswer = answers[idx];

            // Determine correctness by finding the matching option
            let isCorrect = false;
            if (q.type === 'mcq') {
                const labels = ['A', 'B', 'C', 'D'];
                const labelIndex = labels.indexOf(userAnswer.toUpperCase());

                if (labelIndex !== -1 && q.options[labelIndex]) {
                    isCorrect = q.options[labelIndex].isCorrect;
                } else {
                    // Fallback to text match
                    const matchingOption = q.options.find((opt: any) => opt.text === userAnswer);
                    isCorrect = matchingOption ? matchingOption.isCorrect : false;
                }
            } else if (q.type === 'numeric') {
                isCorrect = (parseFloat(userAnswer) === parseFloat(q.answer));
            }

            if (isCorrect) score += (q.points || 10);

            return {
                questionIndex: idx,
                userAnswer,
                isCorrect,
            };
        });

        let audioUrl = "";
        if (audioFile) {
            const bytes = await audioFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const fileName = `${rollNumber}_${quizId}_${Date.now()}.wav`;
            const uploadDir = path.join(process.cwd(), "public", "uploads");
            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, buffer);
            audioUrl = `/uploads/${fileName}`;
        }

        let student = await Student.findOne({ rollName: rollNumber });
        if (!student) {
            student = await Student.create({
                name: `Student ${rollNumber}`,
                rollName: rollNumber,
            });
        }

        const submission = await Submission.create({
            studentId: student._id,
            rollNumber,
            quizId,
            answers: processedAnswers,
            score,
            totalQuestions: quiz.questions.length,
            audioUrl,
        });

        return NextResponse.json({
            message: "Submission received successfully",
            submissionId: submission._id,
            score,
            totalPoints: quiz.questions.length * 10,
        }, { status: 201 });

    } catch (error: any) {
        console.error("[API submit] Error:", error);
        return NextResponse.json({ error: error.message || "Failed to submit" }, { status: 500 });
    }
}
