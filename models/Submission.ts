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
                userAnswer: String,
                isCorrect: Boolean,
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
    },
    { timestamps: true },
);

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
