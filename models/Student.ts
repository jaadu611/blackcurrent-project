import mongoose, { Schema } from "mongoose";

const StudentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the student's name"],
    },
    rollName: {
      type: String,
      required: [true, "Please provide the student's roll name/number"],
    },
  },
  { timestamps: true },
);

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
