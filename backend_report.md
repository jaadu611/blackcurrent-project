# Backend Technical Report: Blackcurrent Project

This report provides a detailed breakdown of the backend architecture, service integrations, and data models currently implemented in the repository.

## 1. Core Architecture
The project is built on **Next.js (App Router)**, utilizing Server-Side API routes (`app/api`) for backend logic. It follows a modular structure with dedicated directories for models (`/models`) and shared utilities (`/lib`).

---

## 2. API Service Layer (`app/api`)

### Authentication & User Management
*   **`/api/signup` & `/api/login`**: Handles teacher registration and authentication using `bcryptjs` for security and `teacher_id` cookies for session management.
*   **`/api/logout`**: Clears authentication cookies.
*   **`/api/me`**: Fetches the current logged-in user's profile from MongoDB.
*   **`/api/token`**: Placeholder for future token-based services (Currently 501 Not Implemented).

### AI & Educational Intelligence
*   **`/api/generate-mcq`**: 
    *   **Logic**: Orchestrates a complex flow that takes uploaded student files and generates 15 branching educational questions (MCQ, Numeric, Voice).
    *   **Engine**: Connects to a local browser instance via **Playwright CDP** to automate Google's NotebookLM.
*   **`/api/transcribe`**: 
    *   **Logic**: Integrates with **AssemblyAI** (Universal-3-Pro model) to convert audio feedback/vivas into text.
    *   **File Handling**: Processes local audio files or uploaded streams.

### Hardware Bridge
*   **`/api/esp/push`**: 
    *   **Logic**: Acts as a proxy to communicate with physical **ESP32** devices.
    *   **Function**: Forwards JSON-formatted question sets to a local IP address where the ESP32 is hosting a listener (typically `/api/load_questions`).

---

## 3. Data Architecture (`/models`)

The system uses **MongoDB** as its primary data store, interfaced via **Mongoose**.

### Teacher Model
*   **Fields**: `fullName`, `number`, `institute`, `email` (unique), `password` (hashed).
*   **Features**: Includes a `pre-save` hook for automatic password encryption and a `comparePassword` method.

### Student Model
*   **Status**: Initialized with minimal fields, used for tracking student-specific grading results.

---

## 4. Automation & Intelligence Engine (`/lib`)

This directory contains the "heavy-lifting" logic of the backend:

### NotebookLM Automator (`notebooklmAutomator.ts`)
*   **Type**: Headless Browser Automation.
*   **Role**: Navigates the Google NotebookLM interface, creates notebooks, uploads source documents, inputs system prompts, and extracts structured JSON responses.
*   **Complexity**: High. Handles dynamic DOM selection, file upload states, and retry logic for AI generation.

### Prompt Engineering (`prompts.ts`)
*   **Content**: Contains the `SYSTEM_PROMPT` used for generating branching educational content.
*   **Strategy**: Enforces strict JSON output with "Hardcoded Branching" (follow-ups for incorrect answers) and "No Spoilers" rules.

---

## 5. External Integrations
| Service | Purpose | Implementation File |
| :--- | :--- | :--- |
| **AssemblyAI** | Audio Transcription (Universal-3-Pro) | `lib/assemblyAI.ts` |
| **Google NotebookLM** | Advanced Content Synthesis & MCQ Generation | `lib/notebooklmAutomator.ts` |
| **Playwright/Chromium** | Headless Browser Automation for AI interaction | `app/api/generate-mcq/route.ts` |
| **MongoDB Atlas** | Primary Database | `lib/mongodb.ts` |

---

## 6. Security & Middleware
*   **`middleware.ts`**: Implements route protection. It intercepts requests to the dashboard and checks for a valid `teacher_id` cookie, redirecting unauthenticated users to `/login`.
*   **Auth Provider**: A frontend-to-backend bridge (`components/AuthProvider.tsx`) that ensures a unified auth state across the entire application.

> [!NOTE]
> The backend relies heavily on a locally running Chrome browser with debugging enabled (`--remote-debugging-port=9222`) for the MCQ generation feature to function correctly.
