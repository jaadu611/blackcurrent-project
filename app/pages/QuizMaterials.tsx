import { useState } from "react";
import { Upload, FileText, CheckCircle2, Eye, Trash2, Download, Plus, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";

type UploadedFile = {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: "processing" | "completed";
};

type Quiz = {
  id: string;
  title: string;
  materialName: string;
  questionsCount: number;
  createdAt: string;
  status: "draft" | "published";
  difficulty: "easy" | "medium" | "hard";
};

// Mock data
const mockFiles: UploadedFile[] = [
  {
    id: "1",
    name: "Introduction to Physics.pdf",
    size: "2.4 MB",
    uploadedAt: "2026-04-15",
    status: "completed",
  },
  {
    id: "2",
    name: "Chemistry Basics.pdf",
    size: "1.8 MB",
    uploadedAt: "2026-04-14",
    status: "completed",
  },
];

const mockQuizzes: Quiz[] = [
  {
    id: "1",
    title: "Physics Chapter 1 Quiz",
    materialName: "Introduction to Physics.pdf",
    questionsCount: 15,
    createdAt: "2026-04-15",
    status: "published",
    difficulty: "medium",
  },
  {
    id: "2",
    title: "Chemistry Fundamentals Quiz",
    materialName: "Chemistry Basics.pdf",
    questionsCount: 20,
    createdAt: "2026-04-14",
    status: "draft",
    difficulty: "easy",
  },
  {
    id: "3",
    title: "Advanced Physics Quiz",
    materialName: "Introduction to Physics.pdf",
    questionsCount: 10,
    createdAt: "2026-04-13",
    status: "published",
    difficulty: "hard",
  },
];

export default function QuizMaterials() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(mockFiles);
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach((file) => {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split("T")[0],
        status: "processing",
      };
      setUploadedFiles((prev) => [...prev, newFile]);

      // Simulate processing completion
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id ? { ...f, status: "completed" } : f
          )
        );
      }, 2000);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const generateQuiz = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId);
    if (!file) return;

    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: `Quiz for ${file.name.replace(".pdf", "")}`,
      materialName: file.name,
      questionsCount: Math.floor(Math.random() * 15) + 10,
      createdAt: new Date().toISOString().split("T")[0],
      status: "draft",
      difficulty: "medium",
    };

    setQuizzes((prev) => [newQuiz, ...prev]);
  };

  const deleteFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Quiz Materials</h2>
        <p className="text-sm text-gray-600">
          Upload study materials and let AI generate quizzes automatically
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload Materials</TabsTrigger>
          <TabsTrigger value="quizzes">
            Generated Quizzes
            <Badge variant="secondary" className="ml-2">
              {quizzes.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Study Materials</CardTitle>
              <CardDescription>
                Upload PDF, DOC, DOCX, or TXT files to create AI-generated quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center transition-colors
                  ${
                    isDragging
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }
                `}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2">Drag and drop files here</h3>
                <p className="text-sm text-gray-600 mb-4">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                  onChange={handleFileInputChange}
                />
                <label htmlFor="file-upload">
                  <Button variant="default" className="cursor-pointer" asChild>
                    <span>Choose Files</span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: PDF, DOC, DOCX, TXT (Max 10MB per file)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Materials</CardTitle>
                <CardDescription>
                  {uploadedFiles.length} file(s) uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.size} • Uploaded {file.uploadedAt}
                          </p>
                        </div>
                        {file.status === "processing" ? (
                          <div className="w-32">
                            <Progress value={60} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              Processing...
                            </p>
                          </div>
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateQuiz(file.id)}
                          disabled={file.status === "processing"}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Quiz
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-6">
          {/* Quiz List */}
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">{quiz.title}</h3>
                        <Badge
                          variant={
                            quiz.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {quiz.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            quiz.difficulty === "easy"
                              ? "border-green-500 text-green-700"
                              : quiz.difficulty === "medium"
                              ? "border-yellow-500 text-yellow-700"
                              : "border-red-500 text-red-700"
                          }
                        >
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Based on: {quiz.materialName}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>{quiz.questionsCount} questions</span>
                        <span>Created {quiz.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedQuiz(quiz)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{quiz.title}</DialogTitle>
                            <DialogDescription>
                              {quiz.questionsCount} questions • {quiz.difficulty}{" "}
                              difficulty
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            {/* Sample Questions */}
                            {[1, 2, 3].map((num) => (
                              <div
                                key={num}
                                className="p-4 bg-gray-50 rounded-lg"
                              >
                                <p className="mb-3">
                                  {num}. What is the main concept discussed in
                                  chapter {num}?
                                </p>
                                <div className="space-y-2 ml-4">
                                  <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name={`q${num}`} />
                                    <span>Option A</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name={`q${num}`} />
                                    <span>Option B</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name={`q${num}`} />
                                    <span>Option C</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name={`q${num}`} />
                                    <span>Option D</span>
                                  </label>
                                </div>
                              </div>
                            ))}
                            <p className="text-sm text-gray-500 text-center">
                              ... and {quiz.questionsCount - 3} more questions
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {quizzes.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2">No quizzes generated yet</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload study materials and generate your first AI-powered quiz
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Materials
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
