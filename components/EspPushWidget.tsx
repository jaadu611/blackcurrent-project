"use client";

import React, { useState } from "react";
import { Wifi, Send, CheckCircle, XCircle, Loader2, Cpu } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function EspPushWidget() {
  const [espIp, setEspIp] = useState("192.168.1.10:80");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState("");

  const handlePush = async () => {
    setStatus("loading");
    setMessage("");

    let clipText: string;
    try {
      clipText = await navigator.clipboard.readText();
      if (!clipText || clipText.trim().length === 0) {
        setStatus("error");
        setMessage("Clipboard is empty — run the NotebookLM automator first.");
        return;
      }
      setPreview(clipText.slice(0, 120) + (clipText.length > 120 ? "..." : ""));
    } catch {
      setStatus("error");
      setMessage(
        "Clipboard access denied. Make sure this page has clipboard permission."
      );
      return;
    }

    try {
      const res = await fetch("/api/esp/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: clipText, espIp }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(json.error || "ESP32 responded with an error.");
      } else {
        setStatus("success");
        setMessage("Questions sent to ESP32 successfully!");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Network error.");
    }
  };

  const statusIcon = {
    idle: <Cpu className="h-4 w-4 text-on-surface-variant" />,
    loading: <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />,
    success: <CheckCircle className="h-4 w-4 text-green-400" />,
    error: <XCircle className="h-4 w-4 text-red-400" />,
  }[status];

  const buttonLabel =
    status === "loading" ? "Pushing..." : "Push Clipboard → ESP32";

  return (
    <div className="rounded-2xl bg-surface-high border border-outline-variant/20 p-6 space-y-5 shadow-lg shadow-surface/40">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Wifi className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">Send to ESP32</p>
          <p className="text-xs text-on-surface-variant">
            Reads NotebookLM output from clipboard
          </p>
        </div>
      </div>

      {/* IP input */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-on-surface-variant">
          ESP32 IP : Port
        </label>
        <input
          type="text"
          value={espIp}
          onChange={(e) => setEspIp(e.target.value)}
          placeholder="192.168.1.10:80"
          className="w-full bg-surface-highest rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-mono"
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="rounded-lg bg-surface/50 border border-outline-variant/10 px-3 py-2">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
            Clipboard Preview
          </p>
          <p className="text-xs text-on-surface-variant font-mono break-all">
            {preview}
          </p>
        </div>
      )}

      {/* Status */}
      {message && (
        <div
          className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
            status === "success"
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {statusIcon}
          {message}
        </div>
      )}

      {/* Push button */}
      <button
        onClick={handlePush}
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-br from-primary-container to-primary py-3 text-sm font-semibold text-[#003915] transition-all hover:brightness-110 hover:underline active:scale-[0.98] disabled:opacity-50"
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {buttonLabel}
      </button>
    </div>
  );
}
