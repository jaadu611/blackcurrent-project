import mongoose, { Schema } from "mongoose";

const SubmissionSchema = new Schema(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
        },
        rollNumber: {
            type: String,
            required: true,
        },
        quizId: {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },
        answers: [
            {
                questionIndex: Number,
                type: { type: String }, // mcq, numeric, voice
                userAnswer: String,
                isCorrect: Boolean,
                transcript: String,
                audioUrl: String,
                followUp: {
                    userAnswer: String,
                    isCorrect: Boolean,
                    transcript: String,
                    audioUrl: String,
                    points: Number,
                }
            },
        ],
        score: {
            type: Number,
            required: true,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        audioUrl: {
            type: String, // Path to the saved audio file
        },
        transcript: {
            type: String, // Transcribed text from AssemblyAI
        },
        completedAt: {
            type: Date,
            default: Date.now,
        },
        aiFeedback: {
            type: String,
        },
        aiScore: {
            type: Number,
        },
    },
    { timestamps: true },
);

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
