import mongoose, { Schema } from "mongoose";

const DeliverableSchema = new Schema(
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
    dueDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["Test", "Assignment", "PPT", "Report", "Essay"],
      default: "Assignment",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Deliverable || mongoose.model("Deliverable", DeliverableSchema);
