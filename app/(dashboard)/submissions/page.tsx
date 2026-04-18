"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Mic,
  ListFilter,
  ChevronRight,
  Search,
  BrainCircuit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMocking, setIsMocking] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.quizId?.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openDetail = (submission: any) => {
    setSelectedSubmission(submission);
    setIsDetailOpen(true);
  };

  const handleMockSubmission = async () => {
    try {
      setIsMocking(true);
      
      // 1. Fetch separate mock data files
      const [resQuizData, resAnswers] = await Promise.all([
        fetch("/mock-quiz.json"),
        fetch("/mock-answers.json")
      ]);
      
      const mockQuiz = await resQuizData.json();
      const mockAnswers = await resAnswers.json();

      // 2. Create the Quiz first to get a valid quizId
      console.log("[DEBUG] Creating mock quiz...");
      const resQuiz = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockQuiz)
      });

      if (!resQuiz.ok) {
        throw new Error("Failed to create mock quiz. Are you logged in?");
      }
      const quizRes = await resQuiz.json();
      const quizId = quizRes.quizId;

      // 3. Construct Submission FormData
      const formData = new FormData();
      formData.append("rollNumber", "DEBUG_" + Math.floor(1000 + Math.random() * 9000));
      formData.append("quizId", quizId);
      formData.append("answers", JSON.stringify(mockAnswers));

      // 4. Attach MP3s from public root based on mapping in mock-answers.json
      for (let i = 0; i < mockAnswers.length; i++) {
        const ans = mockAnswers[i];
        
        // Main audio
        if (ans.audioFile) {
          try {
            const resAudio = await fetch(`/${ans.audioFile}`);
            if (resAudio.ok) {
              const blob = await resAudio.blob();
              formData.append(`audio_q${i}`, blob, ans.audioFile);
              console.log(`[DEBUG] Attached ${ans.audioFile} to audio_q${i}`);
            }
          } catch (e) {
            console.warn(`[DEBUG] Failed to fetch ${ans.audioFile}:`, e);
          }
        }

        // Follow-up audio
        if (ans.followUpAudioFile) {
          try {
            const resAudio = await fetch(`/${ans.followUpAudioFile}`);
            if (resAudio.ok) {
              const blob = await resAudio.blob();
              formData.append(`audio_q${i}_f`, blob, ans.followUpAudioFile);
              console.log(`[DEBUG] Attached ${ans.followUpAudioFile} to audio_q${i}_f`);
            }
          } catch (e) {
            console.warn(`[DEBUG] Failed to fetch ${ans.followUpAudioFile}:`, e);
          }
        }
      }

      // 5. Submit
      console.log("[DEBUG] Submitting mock answers...");
      const resSubmit = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      if (resSubmit.ok) {
        const result = await resSubmit.json();
        console.log("[DEBUG] Submission success:", result);
        fetchSubmissions();
      } else {
        const err = await resSubmit.json();
        alert("Mock submission failed: " + (err.error || "Unknown error"));
      }
    } catch (error: any) {
      console.error("[DEBUG] Mock submission error:", error);
      alert(error.message || "Error triggering mock submission. Check console.");
    } finally {
      setIsMocking(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-black" />
            Quiz Checker
          </h1>
          <p className="text-gray-500 mt-1">
            Review student submissions, voice transcripts, and evaluation
            results.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMockSubmission}
            disabled={isMocking}
            className="border-dashed border-gray-300 text-gray-500 hover:text-black hover:border-black"
          >
            {isMocking ? "Submitting..." : "Debug: Submit Mock"}
          </Button>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by Roll No or Name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Submissions</CardTitle>
            <Badge
              variant="secondary"
              className="bg-white border-gray-200 text-gray-600"
            >
              {filteredSubmissions.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/30">
                <TableHead className="py-4 px-6">Roll Number</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-gray-500"
                  >
                    Loading submissions...
                  </TableCell>
                </TableRow>
              ) : filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-gray-500"
                  >
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((s) => (
                  <TableRow
                    key={s._id}
                    className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => openDetail(s)}
                  >
                    <TableCell className="font-mono font-medium px-6">
                      {s.rollNumber}
                    </TableCell>
                    <TableCell>
                      {s.studentId?.name || "Unknown Student"}
                    </TableCell>
                    <TableCell>{s.quizId?.title || "Deleted Quiz"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{s.score}</span>
                        <span className="text-xs text-gray-400">
                          / {s.totalQuestions * 10}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-100"
                      >
                        Check <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedSubmission && (
            <>
              <DialogHeader className="border-b pb-4">
                <div className="flex items-center justify-between pr-8">
                  <div>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      Submission Context
                      <Badge className="bg-black text-white ml-2">
                        {selectedSubmission.rollNumber}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedSubmission.quizId?.title} •{" "}
                      {new Date(selectedSubmission.createdAt).toLocaleString()}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-black">
                      {selectedSubmission.score}
                      <span className="text-sm font-normal text-gray-400 ml-1">
                        / {selectedSubmission.totalQuestions * 10}
                      </span>
                    </div>
                    <div className="text-[10px] uppercase tracking-tighter font-bold text-gray-400">
                      Total Score
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DetailStatCard
                    label="Student"
                    value={selectedSubmission.studentId?.name}
                    icon={<User className="w-4 h-4" />}
                  />
                  <DetailStatCard
                    label="Total Questions"
                    value={selectedSubmission.totalQuestions}
                    icon={<FileText className="w-4 h-4" />}
                  />
                  <DetailStatCard
                    label="Correct Main"
                    value={
                      selectedSubmission.answers.filter((a: any) => a.isCorrect)
                        .length
                    }
                    icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
                  />
                  <DetailStatCard
                    label="Voice Answers"
                    value={
                      selectedSubmission.answers.filter(
                        (a: any) => a.type === "voice",
                      ).length
                    }
                    icon={<Mic className="w-4 h-4 text-blue-500" />}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ListFilter className="w-5 h-5" />
                    Response Analysis
                  </h3>

                  <div className="space-y-4">
                    {selectedSubmission.answers.map((ans: any, idx: number) => (
                      <Card
                        key={idx}
                        className={`border-l-4 ${ans.isCorrect ? "border-l-green-500" : "border-l-red-500"} bg-gray-50/50`}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase border-gray-300"
                              >
                                {ans.type}
                              </Badge>
                            </div>
                            {ans.isCorrect ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                Correct
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">
                                Incorrect
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                User Answer
                              </p>
                              <p className="font-medium text-gray-900">
                                {ans.userAnswer || "No text provided"}
                              </p>
                            </div>

                            {ans.type === "voice" && ans.transcript && (
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                                  <BrainCircuit className="w-3 h-3" />{" "}
                                  AssemblyAI Transcript
                                </p>
                                <p className="text-sm text-gray-700 italic bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                                  "{ans.transcript}"
                                </p>
                              </div>
                            )}
                          </div>

                          {ans.followUp && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200 border-none text-[9px]">
                                  FOLLOW UP
                                </Badge>
                                {ans.followUp.isCorrect ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-500" />
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Follow-up Answer
                                  </p>
                                  <p className="text-sm font-medium">
                                    {ans.followUp.userAnswer || "No answer"}
                                  </p>
                                </div>
                                {ans.followUp.transcript && (
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                      Voice Follow-up
                                    </p>
                                    <p className="text-xs text-gray-600 bg-blue-50/50 p-2 rounded border border-blue-50 italic">
                                      "{ans.followUp.transcript}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailStatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon: any;
}) {
  return (
    <Card className="bg-gray-50/50 border-gray-100 shadow-none">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
          {icon}
        </div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-tighter">
          {label}
        </div>
        <div className="text-lg font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );
}
