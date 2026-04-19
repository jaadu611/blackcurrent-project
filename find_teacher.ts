import connectToDatabase from "./lib/mongodb";
import Teacher from "./models/Teacher";

async function findTeacher() {
    await connectToDatabase();
    const teachers = await Teacher.find({}, { email: 1, fullName: 1 }).limit(5);
    console.log("Found teachers:", JSON.stringify(teachers, null, 2));
    process.exit(0);
}

findTeacher();
