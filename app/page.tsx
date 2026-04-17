"use client";
import { useState } from "react";

export default function App() {
  const [mode, setMode] = useState<"transcribe" | "mcq">("transcribe");

  // Transcribe State
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");

  // MCQ State
  const [mcqFiles, setMcqFiles] = useState<File[]>([]);
  const [mcqResult, setMcqResult] = useState("");
  const [isGeneratingMcq, setIsGeneratingMcq] = useState(false);

  const testSubmit = async () => {
    try {
      setIsProcessing(true);
      setTranscript(
        "Processing test-audio.mp3 via AssemblyAI (this may take a minute depending on file size)...",
      );
      const response = await fetch("/api/transcribe", { method: "POST" });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setTranscript(data.text || "No transcript returned.");
    } catch (err) {
      console.error(err);
      setTranscript("Failed to transcribe test file. Check console.");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMcq = async () => {
    if (mcqFiles.length === 0) return alert("Please upload files first.");
    try {
      setIsGeneratingMcq(true);
      setMcqResult(
        "Uploading files and orchestrating NotebookLM... this will launch a local browser session.",
      );
      const formData = new FormData();
      mcqFiles.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/generate-mcq", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMcqResult(data.text || "No result returned.");
    } catch (err: any) {
      console.error(err);
      setMcqResult(`Failed to generate MCQs: ${err.message}`);
    } finally {
      setIsGeneratingMcq(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <header className="mb-12 space-y-4">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setMode("transcribe")}
              className={`px-6 py-2 rounded-full border text-sm font-bold transition-all ${mode === "transcribe" ? "bg-purple-600 border-purple-500" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}
            >
              Audio Transcription
            </button>
            <button
              onClick={() => setMode("mcq")}
              className={`px-6 py-2 rounded-full border text-sm font-bold transition-all ${mode === "mcq" ? "bg-purple-600 border-purple-500" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}
            >
              MCQ Generator
            </button>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-linear-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
            Blackcurrent{" "}
            <span className="text-purple-500">
              {mode === "transcribe" ? "Fluency" : "Questions"}
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            {mode === "transcribe"
              ? "Analyze audio and get precise transcripts."
              : "Upload documents to instantly generate MCQ tests via automated AI extraction."}
          </p>
        </header>

        {mode === "transcribe" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                  Transcript
                </h3>
                {isProcessing && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-1 text-xl leading-relaxed font-medium whitespace-pre-wrap">
                {transcript || (
                  <span className="text-gray-600 italic">
                    Click submit to analyze test-audio.mp3...
                  </span>
                )}
              </div>
              <div className="mt-8 flex gap-4">
                <button
                  onClick={testSubmit}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isProcessing
                    ? "Processing via AssemblyAI..."
                    : "Submit (Test MP3)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === "mcq" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                  MCQ Output
                </h3>
                {isGeneratingMcq && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                )}
              </div>

              <div className="mb-6 border-b border-white/10 pb-6">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt"
                  onChange={(e) =>
                    setMcqFiles(Array.from(e.target.files || []))
                  }
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                />
                {mcqFiles.length > 0 && (
                  <p className="mt-2 text-sm text-gray-400 font-medium">
                    {mcqFiles.length} file(s) selected automatically.
                  </p>
                )}
              </div>

              <div className="flex-1 text-base leading-relaxed font-medium whitespace-pre-wrap">
                {mcqResult || (
                  <span className="text-gray-600 italic">
                    Generated MCQs will appear here...
                  </span>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={generateMcq}
                  disabled={isGeneratingMcq || mcqFiles.length === 0}
                  className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isGeneratingMcq
                    ? "Uploading and generating... (check newly opened browser window)"
                    : "Generate 50 MCQs (Run Automator)"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
