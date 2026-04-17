import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const TeacherSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide a full name"],
    },
    number: {
      type: String,
      required: [true, "Please provide a phone number"],
    },
    institute: {
      type: String,
      required: [true, "Please provide an institute name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
    },
  },
  { timestamps: true },
);

// Encrypt password before saving
TeacherSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
TeacherSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema);
