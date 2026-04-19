import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import Submission from "@/models/Submission";
import Student from "@/models/Student";
import fs from "fs";
import path from "path";
import os from "os";
import { run as transcribeAudio } from "@/lib/assemblyAI";
import { chromium } from "playwright";
import { automateNotebookLM } from "@/lib/notebooklmAutomator";
import { QUIZ_EVAL_PROMPT } from "@/lib/prompts";

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
        const processedAnswers: any[] = [];
        const transcriptionTasks: Promise<void>[] = [];

        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            const userAnswerData = answers[i] || {};
            const userAnswer = typeof userAnswerData === 'string' ? userAnswerData : userAnswerData.answer;
            const followUpAnswer = userAnswerData.followUpAnswer;

            // DETECT ROLL NUMBER COLLISION (Index Shift Bug)
            if (i === 0 && String(userAnswer) === String(rollNumber)) {
                console.warn(`[!!] POTENTIAL INDEX SHIFT DETECTED: Question 1 answer "${userAnswer}" matches Student Roll Number "${rollNumber}". Check client-side data unshifting.`);
            }

            let isCorrect = false;
            let transcript = (q.type === 'voice') ? "[Audio Transcribing...]" : "";
            let audioUrl = "";
            let processedFollowUp = null;

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
                    console.log(`[API submit] Audio received for Q${i + 1}: ${audioFile.name} (${audioFile.size} bytes)`);
                    const bytes = await audioFile.arrayBuffer();
                    const fileName = `${rollNumber}_q${i}_${Date.now()}.mp3`;
                    const filePath = path.join(uploadDir, fileName);
                    fs.writeFileSync(filePath, Buffer.from(bytes));
                    audioUrl = `/uploads/${fileName}`;

                    // Set up parallel task with DIRECT object reference
                    const idx = i;
                    // We will update the object's property directly after it's pushed
                } else {
                    console.warn(`[API submit] Q${i + 1} is VOICE type but no audio file was sent (field: audio_q${i})`);
                    transcript = "[No audio received]";
                }
            }

            if (isCorrect) totalScore += (q.points || 10);

            // Handle follow-up
            if (q.followUp) {
                let fIsCorrect = false;
                let fTranscript = (q.followUp.type === 'voice') ? "[Audio Transcribing...]" : "";
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
                        console.log(`[API submit] Follow-up audio received for Q${i + 1}: ${fAudioFile.name} (${fAudioFile.size} bytes)`);
                        const bytes = await fAudioFile.arrayBuffer();
                        const fileName = `${rollNumber}_q${i}_f_${Date.now()}.mp3`;
                        const filePath = path.join(uploadDir, fileName);
                        fs.writeFileSync(filePath, Buffer.from(bytes));
                        fAudioUrl = `/uploads/${fileName}`;
                    } else {
                        console.warn(`[API submit] Q${i + 1} has VOICE follow-up but no audio file was sent`);
                        fTranscript = "[No audio received]";
                    }
                }

                if (fIsCorrect) totalScore += 5;

                processedFollowUp = {
                    userAnswer: followUpAnswer,
                    isCorrect: fIsCorrect,
                    transcript: fTranscript,
                    audioUrl: fAudioUrl,
                    points: fIsCorrect ? 5 : 0
                };
            }

            const currentAnswerObject = {
                questionIndex: i,
                type: q.type,
                userAnswer,
                isCorrect,
                transcript,
                audioUrl,
                followUp: processedFollowUp
            };
            processedAnswers.push(currentAnswerObject);

            // NOW start transcription tasks if needed, passing the direct object reference
            if (q.type === 'voice' && audioUrl) {
                const filePath = path.join(uploadDir, path.basename(audioUrl));
                const task = (async () => {
                    try {
                        const result = await transcribeAudio(filePath);
                        currentAnswerObject.transcript = result || "";
                        console.log(`[API submit] Q${i + 1} Transcript ready: "${result}"`);
                    } catch (e: any) {
                        console.error(`[API submit] Q${i + 1} transcription error:`, e.message);
                    }
                })();
                transcriptionTasks.push(task);
            }

            if (q.followUp?.type === 'voice' && processedFollowUp?.audioUrl) {
                const fFilePath = path.join(uploadDir, path.basename(processedFollowUp.audioUrl));
                const fTask = (async () => {
                    try {
                        const result = await transcribeAudio(fFilePath);
                        if (currentAnswerObject.followUp) {
                            currentAnswerObject.followUp.transcript = result || "";
                        }
                        console.log(`[API submit] Q${i + 1} Follow-up transcript ready: "${result}"`);
                    } catch (e: any) {
                        console.error(`[API submit] Q${i + 1} follow-up transcription error:`, e.message);
                    }
                })();
                transcriptionTasks.push(fTask);
            }
        }

        // Wait for all transcribing in parallel
        if (transcriptionTasks.length > 0) {
            console.log(`[API submit] Waiting for ${transcriptionTasks.length} parallel transcriptions...`);
            await Promise.all(transcriptionTasks);
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

        // ── NEW: NotebookLM Evaluation ──
        let aiFeedback = "";
        let browser: any = null;

        // COMPLETION GUARD: Only evaluate if the quiz is actually finished
        const isFinished = Array.isArray(answers) && answers.length === quiz.questions.length;
        console.log(`[API submit] Completion check: ${answers.length}/${quiz.questions.length} answers received. isFinished=${isFinished}`);

        if (isFinished) {
            const tempEvalDir = path.join(os.tmpdir(), `eval_${Date.now()}`);
            fs.mkdirSync(tempEvalDir, { recursive: true });

            try {
                // FALLBACK: Prepare the source material as a TXT file just in case it needs to create a new notebook
                if (quiz.rawContent) {
                    fs.writeFileSync(path.join(tempEvalDir, "source_material.txt"), quiz.rawContent);
                    console.log("[API submit] Prepared source_material.txt for potential new notebook creation.");
                }

                console.log(`[API submit] Starting NotebookLM evaluation for roll: ${rollNumber}`);

                // 1. Prepare evaluation prompt
                let evaluationPrompt = QUIZ_EVAL_PROMPT + "\n\n";
                evaluationPrompt += `# STUDENT SUBMISSION REPORT\n`;
                evaluationPrompt += `**Roll Number:** ${rollNumber}\n`;
                evaluationPrompt += `**Quiz Title:** ${quiz.title}\n\n`;
                evaluationPrompt += `--- \n\n`;

                processedAnswers.forEach((ans, idx) => {
                    const q = quiz.questions[idx];
                    evaluationPrompt += `### Question ${idx + 1}: ${q.question}\n`;

                    if (q?.type === 'mcq') {
                        const correctOpt = q.options?.find((o: any) => o.isCorrect);
                        evaluationPrompt += `- **Correct Answer:** ${correctOpt ? correctOpt.text : "N/A"}\n`;
                    } else if (q?.type === 'numeric') {
                        evaluationPrompt += `- **Correct Answer:** ${q.answer}\n`;
                    }

                    evaluationPrompt += `- **Student's Answer:** ${ans.userAnswer || "No answer provided"}\n`;
                    if (ans.transcript && ans.transcript !== "[Audio Transcribing...]") {
                        evaluationPrompt += `- **Student's Voice Transcript:** "${ans.transcript}"\n`;
                    }

                    // Show follow-up even if question text is missing (Legacy support)
                    if (ans.followUp || (answers[idx] && answers[idx].followUpAnswer)) {
                        const followUpText = q.followUp?.question || "(Question text not found in database)";
                        const followUpAns = ans.followUp?.userAnswer || answers[idx]?.followUpAnswer || "No answer provided";

                        evaluationPrompt += `\n**Follow-up Question:** ${followUpText}\n`;
                        evaluationPrompt += `- **Student's Follow-up Answer:** ${followUpAns}\n`;

                        if (ans.followUp?.transcript && ans.followUp.transcript !== "[Audio Transcribing...]") {
                            evaluationPrompt += `- **Follow-up Voice Transcript:** "${ans.followUp.transcript}"\n`;
                        }
                    }
                    evaluationPrompt += `\n---\n\n`;
                });

                // 2. Launch Browser
                console.log("[API submit] Step 2: Connecting to browser instance...");
                try {
                    browser = await chromium.connectOverCDP("http://localhost:9222");
                    console.log("[API submit] Connected to existing Brave instance on port 9222");
                } catch {
                    console.warn("[API submit] No CDP instance on 9222. Launching new browser...");
                    const userDataDir = path.join(os.homedir(), ".playwright-notebooklm");
                    browser = await chromium.launchPersistentContext(userDataDir, {
                        headless: false,
                        viewport: { width: 1280, height: 720 },
                    });
                }

                const context = browser.contexts ? browser.contexts()[0] : (browser as any);
                const page = await context.newPage();

                // 3. Run NotebookLM Automation
                const notebookToFind = "final test";
                console.log(`[API submit] Step 3: Searching NotebookLM for notebook: "${notebookToFind}"`);

                aiFeedback = await automateNotebookLM(
                    page,
                    tempEvalDir,
                    evaluationPrompt,
                    notebookToFind
                );
                console.log("[API submit] Step 4: AI response received from NotebookLM");

                // 4. Extract score and save
                let aiScoreMatched = aiFeedback.match(/Score:?\s*(\d+)/i);
                submission.aiFeedback = aiFeedback;
                submission.aiScore = aiScoreMatched ? parseInt(aiScoreMatched[1]) : 0;
                await submission.save();

                console.log(`[API submit] Evaluation complete for roll ${rollNumber}.`);

            } catch (evalError: any) {
                console.error("[API submit] AI Evaluation Error:", evalError.message);
            } finally {
                if (fs.existsSync(tempEvalDir)) fs.rmSync(tempEvalDir, { recursive: true, force: true });
            }
        } else {
            console.log(`[API submit] Submission received mid-quiz (${answers.length}/${quiz.questions.length}). AI Evaluation skipped until final submission.`);
        }

        const response = NextResponse.json(
            {
                message: "Submission successful",
                score: totalScore,
                total: quiz.questions.length,
                aiFeedback: aiFeedback || "Evaluation in progress or skipped"
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
