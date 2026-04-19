import mongoose, { Schema } from "mongoose";

const OptionSchema = new Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    followUp: { type: Schema.Types.Mixed } // allows nested questions or additional info
});

const QuestionSchema = new Schema({
    type: { type: String, required: true },
    question: { type: String, required: true },
    options: [OptionSchema],
    answer: { type: Schema.Types.Mixed }, // fallback for numeric or other types
    points: { type: Number, default: 10 },
    difficulty: { type: Number, default: 5 }, // 1-10
    usageCount: { type: Number, default: 0 },
    lastUsedIndex: { type: Number, default: -1 },
    followUp: { type: Schema.Types.Mixed }, // Adaptive follow-up question
});

const QuizSchema = new Schema(
    {
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        materialName: {
            type: String,
        },
        questions: [QuestionSchema],
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "published",
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium",
        },
        rawContent: {
            type: String,
        },
    },
    { timestamps: true },
);

export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
