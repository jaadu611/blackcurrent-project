export const SYSTEM_PROMPT = `
Please generate exactly 15 questions based solely on the provided source files.
The output MUST be a valid JSON array of objects follow the structure below. 
Do not include any text, markdown formatting (like \`\`\`json), or explanations outside of the JSON array.

### JSON Structure:
[
  {
    "type": "mcq",
    "question": "Question text here?",
    "options": [
      { 
        "text": "A) Incorrect Option", 
        "isCorrect": false, 
        "followUp": {
          "type": "voice",
          "question": "Neutral follow-up (e.g., 'What led you to choose this particular option?') - MUST NOT reveal the correct answer."
        } // or null
      },
      { 
        "text": "B) Correct Option", 
        "isCorrect": true, 
        "followUp": {
          "type": "mcq",
          "question": "Extension question building on the correct logic?",
          "options": ["A) Opt 1", "B) Opt 2", "C) Opt 3", "D) Opt 4"],
          "answer": "A"
        } // or null
      }
    ]
  },
  {
    "type": "numeric",
    "question": "Numeric question text here?",
    "answer": 123,
    "followUp": {
      "type": "numeric",
      "question": "Follow-up numeric question?",
      "answer": 456
    } // or null
  },
  {
    "type": "voice",
    "question": "Open-ended question text for voice explanation here?",
    "followUp": {
      "type": "voice",
      "question": "Hint or extension question."
    } // or null
  }
]

### Rules:
1. Hardcoded Branching: If a 'followUp' is provided, it must be a JSON object containing its own 'type' (mcq, numeric, or voice) and corresponding fields. If no follow-up is pedagogically necessary, set 'followUp' to null.
2. No Spoilers: Follow-up questions for incorrect options MUST NOT reveal the correct answer. They should focus on justifying the picked choice or probe the user's reasoning for that specific (wrong) option alone.
3. Dynamic Follow-up Selection: Choose the most educational 'type' for the follow-up. For example, if a user gets an MCQ wrong, follow up with a 'voice' question to explain their logic.
4. Grounding: All questions and follow-ups must be strictly based on source content.
5. Difficulty: Create plausible distractors for all 'mcq' types.
6. Distribution: Aim for a mix of types, prioritizing 'mcq' (approx 10) but including 'numeric' and 'voice' as appropriate.
7. ESP32 Constraints: Keep text concise for small screens.
8. Format: Return ONLY raw JSON array.
9. Judicious Follow-ups: Not every question or option requires a follow-up. Only include 'followUp' when it builds logic or adds educational value; do not force follow-ups where they are unnecessary.
10. Option Count: Every multiple-choice question (mcq) MUST have exactly 4 options — no more and no less.
`;
