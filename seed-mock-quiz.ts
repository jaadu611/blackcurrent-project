import connectToDatabase from "./lib/mongodb";
import Quiz from "./models/Quiz";
import Teacher from "./models/Teacher";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
    await connectToDatabase();

    const teacher = await Teacher.findOne();
    if (!teacher) {
        console.log("No teacher found. Please sign up first.");
        process.exit(1);
    }

    const mockQuiz = await Quiz.create({
        teacherId: teacher._id,
        title: "ESP32 Sample Quiz",
        materialName: "esp32_sample.pdf",
        questions: [
            {
                question: "What does ESP stand for?",
                options: ["Espressif System Platform", "Extra Sensory Perception", "Electronic Signal Processor", "None of the above"],
                correctAnswer: "Espressif System Platform",
            },
            {
                question: "How many cores does ESP32 have?",
                options: ["1", "2", "3", "4"],
                correctAnswer: "2",
            }
        ],
        status: "published",
        difficulty: "easy",
    });

    console.log("Mock Quiz Created ID:", mockQuiz._id.toString());
    process.exit(0);
}

seed();
