"use client";
import React, { useState, useRef, useEffect } from "react";

const API_KEY = "ef579c93d8274d31a248680d8d60f3fd";

/**
 * AssemblyAIService implementation moved directly into the frontend
 * to match the logic from lib/assemblyAI.ts while bypassing browser-side SDK restrictions.
 */
class AssemblyAIService {
  private socket: WebSocket | null = null;

  constructor(private apiKey: string) {}

  async startStreaming(sampleRate: number, onData: (data: any) => void) {
    if (this.socket) {
      this.socket.close();
    }

    try {
      // Fetch token from our backend to comply with AssemblyAI browser security
      const tokenResponse = await fetch("/api/token");
      const data = await tokenResponse.json();

      if (!data.token) {
        console.error("Token generation failed:", data.error, data.detail);
        throw new Error(data.error || "Failed to get session token");
      }

      const { token } = data;
      const url = `wss://streaming.assemblyai.com/v3/ws?sample_rate=${sampleRate}&token=${token}&speech_model=u3-rt-pro`;
      this.socket = new WebSocket(url);

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // v3 Streaming API uses "Turn" messages for transcripts
        if (data.type === "Turn" && data.transcript) {
          onData({
            text: data.transcript,
            isFinal: data.end_of_turn,
            words: data.words || [],
          });
        }
      };

      this.socket.onerror = (err) => console.error("WebSocket Error:", err);

      return new Promise<void>((resolve, reject) => {
        if (!this.socket) return reject("WebSocket not created");
        this.socket.onopen = () => resolve();
        setTimeout(() => reject("WebSocket timeout"), 10000);
      });
    } catch (err) {
      console.error("AssemblyAI Start Error:", err);
      throw err;
    }
  }

  sendAudio(audioData: Int16Array) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(audioData.buffer);
    }
  }
}

export default function SpeechTracker() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [pauses, setPauses] = useState<string[]>([]);

  const service = useRef(new AssemblyAIService(API_KEY));
  const audioCtx = useRef<AudioContext | null>(null);

  const startAnalysis = async () => {
    try {
      // 1. Initialize AssemblyAI
      let finalText = ""; // To keep track of final text

      await service.current.startStreaming(16000, (data) => {
        if (!data.text) return;

        if (data.isFinal) {
          finalText += (finalText ? " " : "") + data.text;
          setTranscript(finalText);
        } else {
          // Show the final part + current partial
          setTranscript(finalText + " | " + data.text);
        }

        // 2. STUTTER & PAUSE LOGIC (only on final segments for accuracy)
        if (data.isFinal && data.words?.length > 1) {
          const lastWord = data.words[data.words.length - 1];
          const prevWord = data.words[data.words.length - 2];
          const gap = lastWord.start - prevWord.end;

          if (gap > 1000) {
            setPauses((p) => [
              ...p.slice(-4),
              `Pause: ${(gap / 1000).toFixed(1)}s`,
            ]);
          }
        }
      });

      // 3. Setup Mic & PCM Conversion
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx.current = new AudioContext({ sampleRate: 16000 });
      const source = audioCtx.current.createMediaStreamSource(stream);
      const processor = audioCtx.current.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const float32 = e.inputBuffer.getChannelData(0);
        // Convert to Int16 for the API
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          int16[i] = Math.max(-1, Math.min(1, float32[i])) * 0x7fff;
        }
        service.current.sendAudio(int16);
      };

      source.connect(processor);
      processor.connect(audioCtx.current.destination);
      setIsRecording(true);
    } catch (err) {
      alert("Check Console: Likely a 402 (Upgrade Needed) or 401 (Wrong Key)");
    }
  };

  const testSubmit = async () => {
    try {
      setIsRecording(true);
      setTranscript("Processing test-audio.mp3 via AssemblyAI (this may take a minute depending on file size)...");
      
      const response = await fetch("/api/transcribe", {
        method: "POST"
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setTranscript(data.text || "No transcript returned.");
    } catch (err) {
      console.error(err);
      setTranscript("Failed to transcribe test file. Check console.");
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <header className="mb-12 space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium tracking-wider uppercase text-purple-400">
            Real-time Analysis
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-linear-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
            Blackcurrent <span className="text-purple-500">Fluency</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Analyze your speech patterns, detect pauses, and refine your
            delivery with ultra-low latency AI.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Transcript Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-linear-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                    Live Transcript
                  </h3>
                  {isRecording && (
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                        Live
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-xl leading-relaxed font-medium">
                  {transcript ? (
                    <span className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {transcript}
                    </span>
                  ) : (
                    <span className="text-gray-600 italic">
                      {isRecording
                        ? "Listening..."
                        : "Click start to begin session..."}
                    </span>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-4 items-center">
                  <button
                    onClick={
                      isRecording
                        ? () => window.location.reload()
                        : startAnalysis
                    }
                    className={`group relative overflow-hidden px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                      isRecording
                        ? "bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                        : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                       {isRecording ? "Terminate Session" : "Start Live Session"}
                      {!isRecording && (
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={testSubmit}
                    disabled={isRecording && transcript.includes("Processing test-audio.mp3")}
                    className="group relative overflow-hidden px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Submit (Test MP3)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Pause Logs
              </h3>
              <div className="space-y-3">
                {pauses.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-xl">
                    <p className="text-xs text-gray-500">
                      No significant pauses detected yet.
                    </p>
                  </div>
                ) : (
                  pauses.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl animate-in slide-in-from-right-4 duration-300"
                    >
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                      <span className="text-sm font-medium text-yellow-50">
                        {p}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Metrics
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Latency</span>
                  <span className="text-green-400 font-mono">~180ms</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Model</span>
                  <span className="text-purple-400 font-mono">u3-rt-pro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
