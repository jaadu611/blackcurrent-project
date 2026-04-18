import mongoose, { Schema } from "mongoose";

const GradingHistorySchema = new Schema(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    assignmentTitle: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    rawOutput: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.GradingHistory || mongoose.model("GradingHistory", GradingHistorySchema);
