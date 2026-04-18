import mongoose, { Schema } from "mongoose";

const RubricSchema = new Schema(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      unique: true, // One rubric/settings document per teacher
    },
    constraints: {
      type: String,
      default: "",
    },
    referenceDocuments: [
      {
        name: { type: String, required: true },
        size: { type: Number, required: true },
        uploadDate: { type: Date, default: Date.now },
        path: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Rubric || mongoose.model("Rubric", RubricSchema);
