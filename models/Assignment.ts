import mongoose from "mongoose";

const FeedbackItemSchema = new mongoose.Schema({
  aspect: { type: String, required: true }, // e.g., "Clarity", "Accuracy", "Completeness"
  review: { type: String, required: true },
  needsUpdate: { type: Boolean, default: false },
  suggestion: { type: String }
});

const AssignmentSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    studentName: { type: String, required: true },
    rollNumber: { type: String },
    title: { type: String, required: true },
    sourceFiles: [{ type: String }], // URLs to source PDFs
    studentFiles: [{ type: String }], // URLs to student answer PDFs
    grade: { type: String }, // e.g., "85/100" or "A-"
    overallFeedback: { type: String },
    detailedReviews: [FeedbackItemSchema],
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
