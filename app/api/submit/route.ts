import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import Submission from "@/models/Submission";
import Student from "@/models/Student";
import fs from "fs";
import path from "path";
import { run as transcribeAudio } from "@/lib/assemblyAI";

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const formData = await request.formData();
        const rollNumber = formData.get("rollNumber") as string;
        const quizId = formData.get("quizId") as string;
        const answersStr = formData.get("answers") as string;

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

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        let totalScore = 0;
        const processedAnswers = [];

        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            const userAnswerData = answers[i] || {};
            
            // userAnswerData could be a string (legacy) or an object
            const userAnswer = typeof userAnswerData === 'string' ? userAnswerData : userAnswerData.answer;
            const followUpAnswer = userAnswerData.followUpAnswer;

            let isCorrect = false;
            let transcript = "";
            let audioUrl = "";

            // Handle main question
            if (q.type === 'mcq') {
                const labels = ['A', 'B', 'C', 'D'];
                const labelIndex = labels.indexOf(userAnswer?.toUpperCase());
                if (labelIndex !== -1 && q.options[labelIndex]) {
                    isCorrect = q.options[labelIndex].isCorrect;
                } else {
                    const matchingOption = q.options.find((opt: any) => opt.text === userAnswer);
                    isCorrect = matchingOption ? matchingOption.isCorrect : false;
                }
            } else if (q.type === 'numeric') {
                isCorrect = (parseFloat(userAnswer) === parseFloat(q.answer));
            } else if (q.type === 'voice') {
                const audioFile = formData.get(`audio_q${i}`) as File;
                if (audioFile) {
                    const bytes = await audioFile.arrayBuffer();
                    const fileName = `${rollNumber}_q${i}_${Date.now()}.mp3`;
                    const filePath = path.join(uploadDir, fileName);
                    fs.writeFileSync(filePath, Buffer.from(bytes));
                    audioUrl = `/uploads/${fileName}`;
                    
                    // Transcribe
                    transcript = await transcribeAudio(filePath) || "";
                }
            }

            if (isCorrect) totalScore += (q.points || 10);

            // Handle follow-up
            let processedFollowUp = null;
            if (q.followUp) {
                let fIsCorrect = false;
                let fTranscript = "";
                let fAudioUrl = "";

                if (q.followUp.type === 'mcq') {
                    const labels = ['A', 'B', 'C', 'D'];
                    const labelIndex = labels.indexOf(followUpAnswer?.toUpperCase());
                    if (labelIndex !== -1 && q.followUp.options && q.followUp.options[labelIndex]) {
                        fIsCorrect = q.followUp.options[labelIndex].isCorrect;
                    } else if (q.followUp.answer) {
                        fIsCorrect = (followUpAnswer === q.followUp.answer);
                    }
                } else if (q.followUp.type === 'numeric') {
                    fIsCorrect = (parseFloat(followUpAnswer) === parseFloat(q.followUp.answer));
                } else if (q.followUp.type === 'voice') {
                    const fAudioFile = formData.get(`audio_q${i}_f`) as File;
                    if (fAudioFile) {
                        const bytes = await fAudioFile.arrayBuffer();
                        const fileName = `${rollNumber}_q${i}_f_${Date.now()}.mp3`;
                        const filePath = path.join(uploadDir, fileName);
                        fs.writeFileSync(filePath, Buffer.from(bytes));
                        fAudioUrl = `/uploads/${fileName}`;
                        
                        // Transcribe
                        fTranscript = await transcribeAudio(filePath) || "";
                    }
                }

                if (fIsCorrect) totalScore += 5; // Fixed points for follow-up or use from schema

                processedFollowUp = {
                    userAnswer: followUpAnswer,
                    isCorrect: fIsCorrect,
                    transcript: fTranscript,
                    audioUrl: fAudioUrl,
                    points: fIsCorrect ? 5 : 0
                };
            }

            processedAnswers.push({
                questionIndex: i,
                type: q.type,
                userAnswer,
                isCorrect,
                transcript,
                audioUrl,
                followUp: processedFollowUp
            });
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
            score: totalScore,
            totalQuestions: quiz.questions.length,
        });

        return NextResponse.json({
            message: "Submission received and processed successfully",
            submissionId: submission._id,
            score: totalScore,
            totalQuestions: quiz.questions.length,
        }, { status: 201 });

    } catch (error: any) {
        console.error("[API submit] Error:", error);
        return NextResponse.json({ error: error.message || "Failed to submit" }, { status: 500 });
    }
}
