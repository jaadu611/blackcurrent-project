import Quiz from "@/models/Quiz";
import Submission from "@/models/Submission";
import connectToDatabase from "@/lib/mongodb";

/**
 * Selects 10 questions from a quiz pool based on:
 * 1. Balanced total difficulty (target range 45-55 for 10 questions)
 * 2. Recency cooldown (probability is 0 for next 3 students, then increases)
 */
export async function selectQuestionsForQuiz(quizId: string, rollNumber: string) {
    await connectToDatabase();

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        throw new Error("Quiz not found or empty");
    }

    // Get current global submission index for this quiz
    const submissionCount = await Submission.countDocuments({ quizId });
    const currentIndex = submissionCount; // This will be the index for the NEXT submission

    const pool = quiz.questions;
    const targetCount = Math.min(10, pool.length);
    const TARGET_MIN_DIFF = targetCount * 4.5; // e.g. 45 for 10
    const TARGET_MAX_DIFF = targetCount * 6.5; // e.g. 65 for 10

    // 1. Calculate selection probabilities for all questions
    const candidates = pool.map((q: any, originalIndex: number) => {
        const lastUsed = q.lastUsedIndex ?? -1;
        const turnsAgo = lastUsed === -1 ? 999 : (currentIndex - lastUsed);
        
        let probability = 0;
        if (turnsAgo > 3) {
            // After 3 students, probability starts to increase
            // e.g. 4th student: 0.25, 5th: 0.5, 6th: 0.75, 7th+: 1.0
            probability = Math.min(1, (turnsAgo - 3) * 0.25);
        }

        return { 
            question: q, 
            originalIndex, 
            probability,
            weight: Math.random() < probability ? 1 : 0 
        };
    });

    // 2. Filter available questions
    let available = candidates.filter((c: any) => c.weight > 0);

    // Fallback: If not enough questions survive the probability check, add more starting from least recently used
    if (available.length < targetCount) {
        const unavailable = candidates
            .filter((c: any) => c.weight === 0)
            .sort((a: any, b: any) => {
                const turnsA = a.question.lastUsedIndex === -1 ? 999 : (currentIndex - a.question.lastUsedIndex);
                const turnsB = b.question.lastUsedIndex === -1 ? 999 : (currentIndex - b.question.lastUsedIndex);
                return turnsB - turnsA; // Descending turnsAgo
            });
        
        available = [...available, ...unavailable.slice(0, targetCount - available.length)];
    }

    // 3. Select subset that satisfies difficulty range
    // We'll use a randomized greedy approach with retries
    let selectedIndices: number[] = [];
    let bestSelection: any[] = [];
    let bestDiffSum = 0;

    for (let attempt = 0; attempt < 100; attempt++) {
        // Randomly shuffle available
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        const selection = shuffled.slice(0, targetCount);
        const sum = selection.reduce((acc, curr) => acc + (curr.question.difficulty || 5), 0);

        if (sum >= TARGET_MIN_DIFF && sum <= TARGET_MAX_DIFF) {
            bestSelection = selection;
            break;
        }

        // Keep track of closest selection just in case
        if (!bestSelection.length || Math.abs(sum - (TARGET_MIN_DIFF + TARGET_MAX_DIFF)/2) < Math.abs(bestDiffSum - (TARGET_MIN_DIFF + TARGET_MAX_DIFF)/2)) {
            bestSelection = selection;
            bestDiffSum = sum;
        }
    }

    // 4. Update usage history in the background (using Mongoose indices)
    // We'll return the questions first, but logically we need to mark them as used.
    // The calling API should handle the actual DB update to ensure atomicity or just do it here.
    
    // Process selected for return
    const finalQuestions = bestSelection.map(s => {
        const q = s.question.toObject ? s.question.toObject() : s.question;
        return {
            ...q,
            poolIndex: s.originalIndex // Helpful for updating later
        };
    });

    return {
        questions: finalQuestions,
        currentIndex
    };
}

/**
 * Updates the usage metadata for the questions that were picked.
 */
export async function markQuestionsUsed(quizId: string, poolIndices: number[], currentIndex: number) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return;

    poolIndices.forEach(idx => {
        if (quiz.questions[idx]) {
            quiz.questions[idx].usageCount = (quiz.questions[idx].usageCount || 0) + 1;
            quiz.questions[idx].lastUsedIndex = currentIndex;
        }
    });

    await quiz.save();
}
