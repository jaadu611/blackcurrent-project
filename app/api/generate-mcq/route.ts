import { NextResponse } from "next/server";
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import os from "os";
import { automateNotebookLM } from "@/lib/notebooklmAutomator";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import Quiz from "@/models/Quiz";

const NOTEBOOK_TITLE_PREFIX = "MCQ Generator Session";

const debugQuestions = [
  {
    "type": "mcq",
    "question": "An improper integral where both limits are finite, but the integrand has an infinite discontinuity between them, is classified as which type?",
    "options": [
      {
        "text": "A) Type I",
        "isCorrect": false,
        "followUp": {
          "type": "voice",
          "question": "What characteristic of the integration limits actually defines a Type I improper integral?"
        }
      },
      {
        "text": "B) Type II",
        "isCorrect": true,
        "followUp": null
      },
      {
        "text": "C) Type III",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "D) Mixed Kind",
        "isCorrect": false,
        "followUp": null
      }
    ]
  },
  {
    "type": "mcq",
    "question": "The Gamma function is also known by what other name?",
    "options": [
      {
        "text": "A) Euler's integral of the first kind",
        "isCorrect": false,
        "followUp": {
          "type": "voice",
          "question": "You selected the first kind. Which distinct mathematical function is actually associated with Euler's integral of the first kind?"
        }
      },
      {
        "text": "B) Euler's integral of the second kind",
        "isCorrect": true,
        "followUp": null
      },
      {
        "text": "C) Cauchy's principal integral",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "D) Duplication integral",
        "isCorrect": false,
        "followUp": null
      }
    ]
  },
  {
    "type": "numeric",
    "question": "Based on the formula Gamma(n+1) = n!, what is the evaluated value of Gamma(3)?",
    "answer": 2,
    "followUp": {
      "type": "numeric",
      "question": "Using the same logic, what is the value of Gamma(4)?",
      "answer": 6
    }
  },
  {
    "type": "voice",
    "question": "Explain the fundamental difference between an Improper Integral of Type I and an Improper Integral of Type II.",
    "followUp": {
      "type": "voice",
      "question": "How does a Type III improper integral build upon the characteristics of Type I and Type II?"
    }
  },
  {
    "type": "mcq",
    "question": "What is the correct mathematical relationship connecting the Beta function B(m,n) and the Gamma function?",
    "options": [
      {
        "text": "A) B(m,n) = Gamma(m) + Gamma(n)",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "B) B(m,n) = (Gamma(m) * Gamma(n)) / Gamma(m+n)",
        "isCorrect": true,
        "followUp": {
          "type": "mcq",
          "question": "Using this exact relation, which specific Gamma function values are needed to compute B(3,4)?",
          "options": [
            "A) Gamma(3) and Gamma(4) only",
            "B) Gamma(3), Gamma(4), and Gamma(7)",
            "C) Gamma(12) only",
            "D) Gamma(7) only"
          ],
          "answer": "B"
        }
      },
      {
        "text": "C) B(m,n) = Gamma(m+n) / (Gamma(m) * Gamma(n))",
        "isCorrect": false,
        "followUp": {
          "type": "voice",
          "question": "This is the reciprocal of the actual formula. What led you to invert the numerator and denominator?"
        }
      },
      {
        "text": "D) B(m,n) = Gamma(m * n)",
        "isCorrect": false,
        "followUp": null
      }
    ]
  },
  {
    "type": "mcq",
    "question": "Why does the improper integral of 1/x^2 from -1 to 1 fail to converge?",
    "options": [
      {
        "text": "A) The limits of integration are infinite",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "B) It has an infinite discontinuity at x = 0",
        "isCorrect": true,
        "followUp": null
      },
      {
        "text": "C) The function evaluates to a negative area",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "D) It requires the Gamma function to evaluate",
        "isCorrect": false,
        "followUp": null
      }
    ]
  },
  {
    "type": "numeric",
    "question": "According to the source material, what is the constant numerical value of Gamma(1)?",
    "answer": 1,
    "followUp": null
  },
  {
    "type": "mcq",
    "question": "The Beta function is commonly referred to in literature as:",
    "options": [
      {
        "text": "A) Euler's integral of the first kind",
        "isCorrect": true,
        "followUp": null
      },
      {
        "text": "B) Euler's integral of the second kind",
        "isCorrect": false,
        "followUp": {
          "type": "voice",
          "question": "That phrase refers to a different notable mathematical function. Can you recall which one it is?"
        }
      },
      {
        "text": "C) The Mixed Kind Integral",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "D) Cauchy's Integral",
        "isCorrect": false,
        "followUp": null
      }
    ]
  },
  {
    "type": "voice",
    "question": "The integral of 1/x^3 from -1 to 1 diverges in the general sense, yet its Cauchy Principal Value exists. Explain how the principal value effectively bypasses the infinite discontinuity to achieve a result.",
    "followUp": null
  },
  {
    "type": "mcq",
    "question": "If a definite integral has an interval of integration that is not finite (one or both limits are infinite), what type of improper integral is it?",
    "options": [
      {
        "text": "A) Type I",
        "isCorrect": true,
        "followUp": null
      },
      {
        "text": "B) Type II",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "C) Type III",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "D) Convergent Proper Integral",
        "isCorrect": false,
        "followUp": null
      }
    ]
  },
  {
    "type": "mcq",
    "question": "What is the exact constant value of Gamma(1/2)?",
    "options": [
      {
        "text": "A) 1",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "B) Pi",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "C) Square root of Pi",
        "isCorrect": true,
        "followUp": {
          "type": "mcq",
          "question": "Given that Gamma(1/2) is the square root of Pi, which property helps you easily find the value of Gamma(3/2)?",
          "options": [
            "A) Gamma(n+1) = n*Gamma(n)",
            "B) Beta(m,n) symmetry",
            "C) The Duplication Formula",
            "D) Cauchy's Principal Value"
          ],
          "answer": "A"
        }
      },
      {
        "text": "D) Pi / 2",
        "isCorrect": false,
        "followUp": null
      }
    ]
  },
  {
    "type": "numeric",
    "question": "In the solved example demonstrating Beta(3,4), the final simplified fraction is 1 over a specific number. What is that denominator?",
    "answer": 60,
    "followUp": null
  },
  {
    "type": "mcq",
    "question": "According to Property 4 of definite integrals, integrating the function f(x) from 'a' to 'b' yields the exact same result as integrating which of the following functions over those same limits?",
    "options": [
      {
        "text": "A) f(a - x)",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "B) f(b - x)",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "C) f(a + b - x)",
        "isCorrect": true,
        "followUp": null
      },
      {
        "text": "D) f(x - a - b)",
        "isCorrect": false,
        "followUp": {
          "type": "voice",
          "question": "You chose to subtract the bounds from 'x' rather than the other way around. What was your thought process for this substitution?"
        }
      }
    ]
  },
  {
    "type": "mcq",
    "question": "Property 5 dictates that the definite integral of f(x) evaluated from -a to a is exactly 0 under what specific functional condition?",
    "options": [
      {
        "text": "A) When f(-x) = f(x)",
        "isCorrect": false,
        "followUp": {
          "type": "voice",
          "question": "That specific condition defines an even function, which actually doubles the integral from 0 to a. What condition ensures total cancellation instead?"
        }
      },
      {
        "text": "B) When f(-x) = -f(x)",
        "isCorrect": true,
        "followUp": null
      },
      {
        "text": "C) When f(a-x) = f(x)",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "D) When the limits are both infinite",
        "isCorrect": false,
        "followUp": null
      }
    ]
  },
  {
    "type": "mcq",
    "question": "In the stated Duplication Formula for Gamma functions involving the variable 'm', what is the strict mathematical range required for 'm'?",
    "options": [
      {
        "text": "A) m > 1",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "B) m < 0",
        "isCorrect": false,
        "followUp": null
      },
      {
        "text": "C) 0 < m < 1",
        "isCorrect": true,
        "followUp": null
      },
      {
        "text": "D) m can be any integer",
        "isCorrect": false,
        "followUp": {
          "type": "voice",
          "question": "Why did you assume 'm' had to be a whole number integer rather than bounded between two specific fractional limits?"
        }
      }
    ]
  }
];

export async function POST(req: Request) {
  let tempDir = "";
  let browser: any = null;

  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File;
    const rollNumber = formData.get("rollNumber") as string || "admin";
    const quizTitle = formData.get("title") as string || `Quiz Pool - ${Date.now()}`;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    console.log(`[API generate-mcq] Starting automation for roll: ${rollNumber}`);

    // 1. Save PDF to temp directory
    tempDir = path.join(os.tmpdir(), `notebooklm_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(tempDir, file.name);
    fs.writeFileSync(filePath, buffer);

    // 2. Launch Browser with persistent context
    const userDataDir = path.join(os.homedir(), ".playwright-notebooklm");
    browser = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      viewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();
    
    // 3. Run Automation
    const notebookTitle = `Pool_${rollNumber}_${Date.now()}`;
    const rawResult = await automateNotebookLM(
      page,
      tempDir,
      SYSTEM_PROMPT,
      notebookTitle
    );

    // 4. Parse JSON result
    // The result might have markdown wrapper, cleaned by automateNotebookLM usually but double check
    let questionsPool = [];
    try {
      const jsonMatch = rawResult.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : rawResult;
      questionsPool = JSON.parse(jsonStr);
    } catch (e) {
      console.error("[API] JSON Parse Error. Raw result:", rawResult);
      throw new Error("AI returned invalid JSON format.");
    }

    // 5. Save to MongoDB as a new Quiz Pool
    // This allows the selector to track usage across multiple students
    const newQuiz = await Quiz.create({
      teacherId: new (require("mongoose")).Types.ObjectId(), // Placeholder or from session
      title: quizTitle,
      questions: questionsPool.map((q: any) => ({
        ...q,
        usageCount: 0,
        lastUsedIndex: -1
      })),
      status: "published"
    });

    console.log(`[API] Created new quiz pool with ${questionsPool.length} questions. ID: ${newQuiz._id}`);

    // 6. Use the selector to pick the first 10 for the current user
    const { selectQuestionsForQuiz, markQuestionsUsed } = require("@/lib/quizSelector");
    const { questions: selectedQuestions, currentIndex } = await selectQuestionsForQuiz(newQuiz._id.toString(), rollNumber);
    
    // Mark them as used
    const poolIndices = selectedQuestions.map((q: any) => q.poolIndex);
    await markQuestionsUsed(newQuiz._id.toString(), poolIndices, currentIndex);

    // 7. Push the SELECTED 10 to ESP32
    const STATION_IP = process.env.STATION_IP || "10.30.233.98";
    const espUrl = `http://${STATION_IP}/api/load_questions`;

    console.log(`[API] Pushing selected 10 questions to ESP at ${espUrl}`);
    
    // Background fetch to ESP
    fetch(espUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedQuestions),
    }).then(res => {
      if (res.ok) console.log("[API] Successfully synced to ESP32");
      else console.error("[API] ESP32 returned error:", res.status);
    }).catch(err => {
      console.warn("[API] Could not reach ESP32 station:", err.message);
    });

    return NextResponse.json({ 
      success: true, 
      quizId: newQuiz._id,
      questions: selectedQuestions 
    });

  } catch (error: any) {
    console.error("[API generate-mcq] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Cleanup
    if (browser) await browser.close();
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

