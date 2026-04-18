"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, BrainCircuit, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AssignmentsPage() {
  const [sourceFiles, setSourceFiles] = useState<FileList | null>(null);
  const [studentFiles, setStudentFiles] = useState<FileList | null>(null);
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [title, setTitle] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCheck = async () => {
    if (!sourceFiles || !studentFiles || !studentName || !title) {
      toast.error("Please fill all required fields and upload files.");
      return;
    }

    setIsChecking(true);
    setResult(null);

    const formData = new FormData();
    formData.append("studentName", studentName);
    formData.append("rollNumber", rollNumber);
    formData.append("title", title);
    Array.from(sourceFiles).forEach((file, i) => formData.append(`source_${i}`, file));
    Array.from(studentFiles).forEach((file, i) => formData.append(`student_${i}`, file));

    try {
      const res = await fetch("/api/check-assignment", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to check assignment");
      const data = await res.json();
      setResult(data);
      toast.success("Assignment checked successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to check assignment. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Assignment Checker
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload source materials and student submission. NotebookLM will grade it automatically.
        </p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left: Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-base">Assignment Details</h2>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input
              placeholder="e.g., Improper Integrals Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Student Name</label>
              <Input
                placeholder="John Doe"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Roll Number</label>
              <Input
                placeholder="S12345"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Right: Uploads */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-base">File Uploads</h2>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Upload className="w-4 h-4" /> Source Material (Reference PDF)
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setSourceFiles(e.target.files)}
              className="w-full text-sm text-gray-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 file:font-medium hover:file:bg-gray-200 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <FileText className="w-4 h-4" /> Student Submission
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setStudentFiles(e.target.files)}
              className="w-full text-sm text-gray-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 file:font-medium hover:file:bg-gray-200 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-black text-white px-10 font-semibold rounded-lg hover:bg-gray-800"
          onClick={handleCheck}
          disabled={isChecking}
        >
          {isChecking ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking with NotebookLM...</>
          ) : (
            <><BrainCircuit className="mr-2 h-5 w-5" />Run AI Check</>
          )}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          
          {/* Grade Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Grading Report</h2>
              <p className="text-sm text-gray-500">AI evaluation based on source materials.</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-gray-900">{result.grade}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Grade</div>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Overall Feedback */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Overall Feedback
              </h3>
              <p className="text-gray-800 leading-relaxed">{result.overallFeedback}</p>
            </div>

            {/* Detailed Reviews */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Aspect-by-Aspect Review
              </h3>
              <div className="space-y-3">
                {result.detailedReviews?.map((review: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 bg-gray-50 ${review.needsUpdate ? "border-l-amber-400" : "border-l-green-400"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{review.aspect}</span>
                      {review.needsUpdate && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                          <AlertTriangle className="w-3 h-3" /> Needs Update
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{review.review}</p>
                    {review.suggestion && (
                      <p className="mt-2 text-xs text-gray-500 bg-white border border-gray-100 rounded p-2">
                        <span className="font-semibold text-gray-700">Suggestion: </span>
                        {review.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
