"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, BrainCircuit, Loader2, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    
    Array.from(sourceFiles).forEach((file, index) => {
      formData.append(`source_${index}`, file);
    });
    
    Array.from(studentFiles).forEach((file, index) => {
      formData.append(`student_${index}`, file);
    });

    try {
      const res = await fetch("/api/check-assignment", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to check assignment");
      }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-black" />
            Assignment Checker
          </h1>
          <p className="text-gray-500 mt-1">
            Automated grading and feedback powered by NotebookLM.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Assignment Details</CardTitle>
            <CardDescription>Enter basic information about the submission.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignment Title</label>
              <Input 
                placeholder="e.g., Improper Integrals Quiz" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Student Name</label>
                <Input 
                  placeholder="John Doe" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Roll Number</label>
                <Input 
                  placeholder="S12345" 
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">File Uploads</CardTitle>
            <CardDescription>Upload source materials and student work.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" /> Source Materials (Reference PDF)
              </label>
              <Input 
                type="file" 
                multiple 
                onChange={(e) => setSourceFiles(e.target.files)}
                className="cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" /> Student Submission
              </label>
              <Input 
                type="file" 
                multiple 
                onChange={(e) => setStudentFiles(e.target.files)}
                className="cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="bg-black text-white px-12 h-14 text-lg font-bold rounded-full hover:scale-105 transition-all shadow-xl"
          onClick={handleCheck}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Checking with NotebookLM...
            </>
          ) : (
            <>
              <BrainCircuit className="mr-2 h-6 w-6" />
              Run AI Check
            </>
          )}
        </Button>
      </div>

      {result && (
        <Card className="border-black border-2 bg-gray-50/30 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between py-6">
            <div>
              <CardTitle className="text-2xl font-black">Grading Report</CardTitle>
              <CardDescription>AI-generated evaluation based on source materials.</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-black leading-none">
                {result.grade}
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-widest">
                Assigned Grade
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Overall Performance
              </h3>
              <p className="text-lg text-gray-800 leading-relaxed font-medium">
                {result.overallFeedback}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                Detailed Aspect Analysis
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {result.detailedReviews.map((review: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border-l-4 bg-white shadow-sm ${review.needsUpdate ? 'border-l-amber-500' : 'border-l-green-500'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{review.aspect}</span>
                      {review.needsUpdate && (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Needs Update
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {review.review}
                    </p>
                    {review.suggestion && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 italic text-xs text-gray-500 mt-2">
                        <span className="font-bold text-gray-700 not-italic mr-1">Suggestion:</span>
                        {review.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
