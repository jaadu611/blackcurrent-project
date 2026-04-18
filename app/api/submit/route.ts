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

        console.log(`[API submit] Incoming submission from roll: ${rollNumber}, quizId: ${quizId}`);

        if (!rollNumber || !quizId || !answersStr) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const answers = JSON.parse(answersStr);
        console.log(`[API submit] RAW DATA RECEIVED FROM ESP:`, answersStr);

        let quiz = null;
        const cleanQuizId = (quizId || "").trim().replace(/^["']|["']$/g, '');

        // 1. Try to find by ID if it looks like a valid ObjectId
        if (cleanQuizId && cleanQuizId.length === 24 && /^[0-9a-fA-F]{24}$/.test(cleanQuizId)) {
            quiz = await Quiz.findById(cleanQuizId);
        }

        // 2. Fallback to latest quiz if ID is missing, invalid (like "demo_quiz"), or not found
        if (!quiz) {
            console.log(`[API submit] No valid quiz found for ID "${cleanQuizId}". Falling back to most recent quiz.`);
            quiz = await Quiz.findOne().sort({ createdAt: -1 });
        }

        if (!quiz) {
            console.error("[API submit] Critical failure: No quizzes exist in database.");
            return NextResponse.json({ error: "No quizzes found in database. Please create one first." }, { status: 404 });
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

        // Detailed Terminal Logging
        console.log("\n" + "=".repeat(50));
        console.log(`SUBMISSION RECEIVED: Roll ${rollNumber}`);
        console.log(`Quiz: ${quiz.title}`);
        console.log("-".repeat(50));
        processedAnswers.forEach((ans, idx) => {
            const q = quiz.questions[idx];
            const rawAns = answers[idx] || {};
            // Look for any time-related key (time, duration, timeTaken, seconds, etc.)
            const timeVal = rawAns.time ?? rawAns.duration ?? rawAns.timeTaken ?? rawAns.seconds ?? "N/A";

            let displayAns = ans.userAnswer;
            if (q.type === 'voice') displayAns = "AUDIO";

            console.log(`Q${idx + 1}: ${q.question.substring(0, 50)}${q.question.length > 50 ? "..." : ""}`);
            console.log(`   Answer: [${displayAns}] | Time: ${timeVal}s`);

            if (ans.followUp) {
                const fTimeVal = rawAns.followUpTime ?? rawAns.followUpDuration ?? "N/A";
                let fDisplayAns = ans.followUp.userAnswer;
                if (q.followUp?.type === 'voice') fDisplayAns = "AUDIO";
                console.log(`   Follow-up: [${fDisplayAns}] | Time: ${fTimeVal}s`);
            }
        });
        console.log("-".repeat(50));
        console.log(`SUBMISSION PROCESSING COMPLETE`);
        console.log("=".repeat(50) + "\n");

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
            quizId: quiz._id,
            answers: processedAnswers,
            score: totalScore,
            totalQuestions: quiz.questions.length,
        });

        const response = NextResponse.json(
            {
                message: "Submission successful",
                score: totalScore,
                total: quiz.questions.length,
            },
            { status: 201 }
        );

        // Add CORS headers for ESP Web UI
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");

        return response;
    } catch (error: any) {
        console.error("[API submit] Error:", error);
        const response = NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
        response.headers.set("Access-Control-Allow-Origin", "*");
        return response;
    }
}

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return response;
}
