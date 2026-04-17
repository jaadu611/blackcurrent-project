"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Users,
  Check,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

type VivaQuestion = {
  id: string;
  question: string;
  expectedAnswer: string;
  points: number;
};

type VivaPaper = {
  id: string;
  title: string;
  subject: string;
  totalQuestions: number;
  totalPoints: number;
  createdAt: string;
  questions: VivaQuestion[];
};

type ClassData = {
  id: string;
  name: string;
  studentCount: number;
};

type StudentVivaStatus = {
  id: string;
  name: string;
  rollNumber: string;
  status: "waiting" | "in-progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  currentQuestion?: number;
  totalQuestions: number;
  score?: number;
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
const mockClasses: ClassData[] = [
  { id: "1", name: "Class 10-A", studentCount: 30 },
  { id: "2", name: "Class 10-B", studentCount: 28 },
  { id: "3", name: "Class 11-A", studentCount: 25 },
  { id: "4", name: "Class 11-B", studentCount: 27 },
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

const mockPapers: VivaPaper[] = [
  {
    id: "1",
    title: "Physics Viva - Chapter 1",
    subject: "Physics",
    totalQuestions: 10,
    totalPoints: 100,
    createdAt: "2026-04-15",
    questions: [
      {
        id: "q1",
        question: "What is Newton's First Law of Motion?",
        expectedAnswer:
          "An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force.",
        points: 10,
      },
      {
        id: "q2",
        question: "Define velocity and explain how it differs from speed.",
        expectedAnswer:
          "Velocity is the rate of change of displacement. It is a vector quantity (has direction), while speed is a scalar quantity (magnitude only).",
        points: 10,
      },
    ],
  },
  {
    id: "2",
    title: "Chemistry Fundamentals",
    subject: "Chemistry",
    totalQuestions: 8,
    totalPoints: 80,
    createdAt: "2026-04-14",
    questions: [
      {
        id: "q1",
        question: "What is the periodic table?",
        expectedAnswer:
          "A tabular arrangement of chemical elements organized by atomic number, electron configuration, and recurring chemical properties.",
        points: 10,
      },
    ],
  },
];

export default function VivaMaterials() {
  const [papers, setPapers] = useState<VivaPaper[]>(mockPapers);
  const [selectedPaper, setSelectedPaper] = useState<VivaPaper | null>(null);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false);
  const [isImportQuizOpen, setIsImportQuizOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<VivaQuestion | null>(
    null,
  );
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [activeVivaClass, setActiveVivaClass] = useState<string | null>(null);
  const [vivaStarted, setVivaStarted] = useState(false);
  const [availableQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");

  const runTranscriptionTest = async () => {
    try {
      setIsTranscribing(true);
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
      setIsTranscribing(false);
    }
  };

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    expectedAnswer: "",
    points: 10,
  });

  const [students, setStudents] = useState<StudentVivaStatus[]>([
    {
      id: "1",
      name: "Rahul Sharma",
      rollNumber: "001",
      status: "completed",
      startedAt: "10:00 AM",
      completedAt: "10:15 AM",
      totalQuestions: 10,
      score: 85,
    },
    {
      id: "2",
      name: "Priya Patel",
      rollNumber: "002",
      status: "in-progress",
      startedAt: "10:05 AM",
      currentQuestion: 5,
      totalQuestions: 10,
    },
    {
      id: "3",
      name: "Amit Kumar",
      rollNumber: "003",
      status: "in-progress",
      startedAt: "10:10 AM",
      currentQuestion: 3,
      totalQuestions: 10,
    },
    {
      id: "4",
      name: "Sneha Desai",
      rollNumber: "004",
      status: "waiting",
      totalQuestions: 10,
    },
    {
      id: "5",
      name: "Vikram Singh",
      rollNumber: "005",
      status: "waiting",
      totalQuestions: 10,
    },
  ]);

  const handleAddQuestion = () => {
    if (!selectedPaper) return;

    const question: VivaQuestion = {
      id: `q${Date.now()}`,
      ...newQuestion,
    };

    const updatedPaper = {
      ...selectedPaper,
      questions: [...selectedPaper.questions, question],
      totalQuestions: selectedPaper.totalQuestions + 1,
      totalPoints: selectedPaper.totalPoints + newQuestion.points,
    };

    setPapers(
      papers.map((p) => (p.id === selectedPaper.id ? updatedPaper : p)),
    );
    setSelectedPaper(updatedPaper);
    setNewQuestion({ question: "", expectedAnswer: "", points: 10 });
    setIsAddQuestionOpen(false);
  };

  const handleUpdateQuestion = () => {
    if (!selectedPaper || !editingQuestion) return;

    const updatedPaper = {
      ...selectedPaper,
      questions: selectedPaper.questions.map((q) =>
        q.id === editingQuestion.id ? editingQuestion : q,
      ),
    };

    setPapers(
      papers.map((p) => (p.id === selectedPaper.id ? updatedPaper : p)),
    );
    setSelectedPaper(updatedPaper);
    setEditingQuestion(null);
    setIsEditQuestionOpen(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedPaper) return;

    const questionToDelete = selectedPaper.questions.find(
      (q) => q.id === questionId,
    );
    if (!questionToDelete) return;

    const updatedPaper = {
      ...selectedPaper,
      questions: selectedPaper.questions.filter((q) => q.id !== questionId),
      totalQuestions: selectedPaper.totalQuestions - 1,
      totalPoints: selectedPaper.totalPoints - questionToDelete.points,
    };

    setPapers(
      papers.map((p) => (p.id === selectedPaper.id ? updatedPaper : p)),
    );
    setSelectedPaper(updatedPaper);
  };

  const handleImportQuiz = () => {
    if (!selectedQuizId) return;

    const selectedQuiz = availableQuizzes.find((q) => q.id === selectedQuizId);
    if (!selectedQuiz) return;

    // Generate sample questions based on quiz
    const questions: VivaQuestion[] = Array.from(
      { length: selectedQuiz.questionsCount },
      (_, i) => ({
        id: `q${Date.now()}-${i}`,
        question: `Question ${i + 1} from ${selectedQuiz.title}?`,
        expectedAnswer: `Expected answer for question ${i + 1}. This should be based on the content from ${selectedQuiz.materialName}.`,
        points: 10,
      }),
    );

    const newPaper: VivaPaper = {
      id: `paper-${Date.now()}`,
      title: `Viva: ${selectedQuiz.title}`,
      subject: selectedQuiz.materialName.replace(".pdf", ""),
      totalQuestions: selectedQuiz.questionsCount,
      totalPoints: selectedQuiz.questionsCount * 10,
      createdAt: new Date().toISOString().split("T")[0],
      questions,
    };

    setPapers([...papers, newPaper]);
    setSelectedQuizId("");
    setIsImportQuizOpen(false);
  };

  const handleStartViva = () => {
    if (!selectedClass || !selectedPaper) return;
    setActiveVivaClass(selectedClass);
    setVivaStarted(true);
  };

  const handleEvaluateAll = () => {
    // Simulate evaluation for all students
    setStudents(
      students.map((student) => {
        if (student.status === "completed") return student;

        return {
          ...student,
          status: "completed",
          completedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
        };
      }),
    );
  };

  const inProgressCount = students.filter(
    (s) => s.status === "in-progress",
  ).length;
  const completedCount = students.filter(
    (s) => s.status === "completed",
  ).length;
  const waitingCount = students.filter((s) => s.status === "waiting").length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Viva Materials</h2>
          <p className="text-sm text-gray-600">
            Create viva papers, manage questions, and conduct live oral
            examinations
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Fluency Test Lab
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 font-bold text-xl">
                Blackcurrent Fluency Lab
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Test audio transcription via AssemblyAI. This analyzes the
                default test-audio.mp3 file.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 min-h-[220px] flex flex-col shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Transcript Preview
                  </h3>
                  {isTranscribing && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-red-500 font-bold animate-pulse">
                        LIVE
                      </span>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap font-medium text-gray-800">
                  {transcript || (
                    <span className="text-gray-400 italic font-normal">
                      Click start to analyze test-audio.mp3...
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={runTranscriptionTest}
                disabled={isTranscribing}
                className="w-full py-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 transition-all transform active:scale-[0.98]"
              >
                {isTranscribing
                  ? "Processing via AssemblyAI..."
                  : "Start Transcription Analysis"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {/* Paper Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Viva Papers</CardTitle>
                <CardDescription>
                  Select a paper to view or update questions
                </CardDescription>
              </div>
              <Dialog
                open={isImportQuizOpen}
                onOpenChange={setIsImportQuizOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Import from Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Quiz as Viva Paper</DialogTitle>
                    <DialogDescription>
                      Select a quiz to convert into a viva paper
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="quiz-select">Select Quiz</Label>
                      <Select
                        value={selectedQuizId}
                        onValueChange={setSelectedQuizId}
                      >
                        <SelectTrigger id="quiz-select">
                          <SelectValue placeholder="Choose a quiz" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableQuizzes.map((quiz) => (
                            <SelectItem key={quiz.id} value={quiz.id}>
                              {quiz.title} ({quiz.questionsCount} questions)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedQuizId && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          {
                            availableQuizzes.find(
                              (q) => q.id === selectedQuizId,
                            )?.questionsCount
                          }{" "}
                          questions will be imported with 10 points each
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsImportQuizOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImportQuiz}
                      disabled={!selectedQuizId}
                    >
                      Import Quiz
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPaper?.id === paper.id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedPaper(paper)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">{paper.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {paper.subject}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{paper.totalQuestions} questions</span>
                        <span>{paper.totalPoints} points</span>
                        <span>Created {paper.createdAt}</span>
                      </div>
                    </div>
                    <Button
                      variant={
                        selectedPaper?.id === paper.id ? "default" : "outline"
                      }
                      size="sm"
                      className={
                        selectedPaper?.id === paper.id
                          ? "bg-red-500 hover:bg-red-600"
                          : ""
                      }
                    >
                      {selectedPaper?.id === paper.id ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        {selectedPaper && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions - {selectedPaper.title}</CardTitle>
                  <CardDescription>
                    {selectedPaper.totalQuestions} questions •{" "}
                    {selectedPaper.totalPoints} total points
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddQuestionOpen}
                  onOpenChange={setIsAddQuestionOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Question</DialogTitle>
                      <DialogDescription>
                        Create a new viva question for this paper
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="question">Question</Label>
                        <Textarea
                          id="question"
                          placeholder="Enter the viva question"
                          value={newQuestion.question}
                          onChange={(e) =>
                            setNewQuestion({
                              ...newQuestion,
                              question: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="answer">Expected Answer</Label>
                        <Textarea
                          id="answer"
                          placeholder="Enter the expected answer or key points"
                          value={newQuestion.expectedAnswer}
                          onChange={(e) =>
                            setNewQuestion({
                              ...newQuestion,
                              expectedAnswer: e.target.value,
                            })
                          }
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="points">Points</Label>
                        <Input
                          id="points"
                          type="number"
                          value={newQuestion.points}
                          onChange={(e) =>
                            setNewQuestion({
                              ...newQuestion,
                              points: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddQuestionOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddQuestion}>Add Question</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedPaper.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Q{index + 1}.
                          </span>
                          <Badge variant="secondary">
                            {question.points} pts
                          </Badge>
                        </div>
                        <p className="text-sm mb-3">{question.question}</p>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500 mb-1">
                            Expected Answer:
                          </p>
                          <p className="text-sm text-gray-700">
                            {question.expectedAnswer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingQuestion(question);
                            setIsEditQuestionOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {selectedPaper.questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">No questions added yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Add Question" to create your first viva question
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Question Dialog */}
        <Dialog open={isEditQuestionOpen} onOpenChange={setIsEditQuestionOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>
                Update the viva question details
              </DialogDescription>
            </DialogHeader>
            {editingQuestion && (
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-question">Question</Label>
                  <Textarea
                    id="edit-question"
                    value={editingQuestion.question}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        question: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-answer">Expected Answer</Label>
                  <Textarea
                    id="edit-answer"
                    value={editingQuestion.expectedAnswer}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        expectedAnswer: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-points">Points</Label>
                  <Input
                    id="edit-points"
                    type="number"
                    value={editingQuestion.points}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditQuestionOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateQuestion}>Update Question</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Select Class and Start Viva */}
        {selectedPaper && (
          <Card>
            <CardHeader>
              <CardTitle>Start Viva Session</CardTitle>
              <CardDescription>
                Select a class and begin the viva examination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="class-select">Select Class</Label>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger id="class-select">
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.studentCount} students)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleStartViva}
                  disabled={!selectedClass || vivaStarted}
                  className={`min-w-[180px] shadow-lg ${
                    vivaStarted
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white shadow-red-100"
                  }`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {vivaStarted ? "Viva In Progress" : "Start Viva"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Viva Monitoring */}
        {vivaStarted && selectedPaper && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Viva Status</CardTitle>
                  <CardDescription>
                    {mockClasses.find((c) => c.id === activeVivaClass)?.name} •{" "}
                    {selectedPaper.title}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {students.length} students
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      Waiting: {waitingCount}
                    </Badge>
                    <Badge
                      variant="default"
                      className="flex items-center gap-1 bg-blue-500"
                    >
                      <Clock className="w-3 h-3" />
                      In Progress: {inProgressCount}
                    </Badge>
                    <Badge
                      variant="default"
                      className="flex items-center gap-1 bg-green-500"
                    >
                      <Check className="w-3 h-3" />
                      Completed: {completedCount}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Started At</TableHead>
                      <TableHead>Completed At</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === "completed"
                                ? "default"
                                : student.status === "in-progress"
                                  ? "default"
                                  : "secondary"
                            }
                            className={
                              student.status === "completed"
                                ? "bg-green-500"
                                : student.status === "in-progress"
                                  ? "bg-blue-500"
                                  : ""
                            }
                          >
                            {student.status === "completed"
                              ? "Completed"
                              : student.status === "in-progress"
                                ? "In Progress"
                                : "Waiting"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {student.status === "in-progress" &&
                          student.currentQuestion
                            ? `${student.currentQuestion}/${student.totalQuestions}`
                            : student.status === "completed"
                              ? `${student.totalQuestions}/${student.totalQuestions}`
                              : "-"}
                        </TableCell>
                        <TableCell>{student.startedAt || "-"}</TableCell>
                        <TableCell>{student.completedAt || "-"}</TableCell>
                        <TableCell className="text-right">
                          {student.score !== undefined ? (
                            <span className="font-medium">
                              {student.score}/100
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleEvaluateAll}
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Evaluate All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
