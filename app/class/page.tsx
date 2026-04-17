"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ChevronRight,
  ChevronDown,
  User,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

type Student = {
  id: string;
  name: string;
  email: string;
  quizStatus: "completed" | "pending" | "in-progress";
  quizMarks: number;
  vivaMarks: number;
  totalMarks: number;
};

type ClassData = {
  id: string;
  name: string;
  totalStudents: number;
  students: Student[];
};

// Mock data
const mockClasses: ClassData[] = [
  {
    id: "1",
    name: "Physics 101",
    totalStudents: 28,
    students: [
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        quizStatus: "completed",
        quizMarks: 85,
        vivaMarks: 78,
        totalMarks: 163,
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        quizStatus: "completed",
        quizMarks: 92,
        vivaMarks: 88,
        totalMarks: 180,
      },
      {
        id: "3",
        name: "Michael Johnson",
        email: "michael.j@example.com",
        quizStatus: "pending",
        quizMarks: 0,
        vivaMarks: 0,
        totalMarks: 0,
      },
      {
        id: "4",
        name: "Emily Brown",
        email: "emily.brown@example.com",
        quizStatus: "in-progress",
        quizMarks: 45,
        vivaMarks: 0,
        totalMarks: 45,
      },
    ],
  },
  {
    id: "2",
    name: "Chemistry 201",
    totalStudents: 32,
    students: [
      {
        id: "5",
        name: "Sarah Williams",
        email: "sarah.w@example.com",
        quizStatus: "completed",
        quizMarks: 88,
        vivaMarks: 82,
        totalMarks: 170,
      },
      {
        id: "6",
        name: "David Lee",
        email: "david.lee@example.com",
        quizStatus: "completed",
        quizMarks: 76,
        vivaMarks: 80,
        totalMarks: 156,
      },
    ],
  },
  {
    id: "3",
    name: "Biology 102",
    totalStudents: 25,
    students: [
      {
        id: "7",
        name: "Lisa Anderson",
        email: "lisa.a@example.com",
        quizStatus: "completed",
        quizMarks: 94,
        vivaMarks: 90,
        totalMarks: 184,
      },
    ],
  },
  {
    id: "4",
    name: "Mathematics 301",
    totalStudents: 30,
    students: [
      {
        id: "8",
        name: "Robert Taylor",
        email: "robert.t@example.com",
        quizStatus: "pending",
        quizMarks: 0,
        vivaMarks: 0,
        totalMarks: 0,
      },
    ],
  },
  {
    id: "5",
    name: "English Literature",
    totalStudents: 22,
    students: [
      {
        id: "9",
        name: "Amanda White",
        email: "amanda.w@example.com",
        quizStatus: "completed",
        quizMarks: 87,
        vivaMarks: 85,
        totalMarks: 172,
      },
    ],
  },
];

export default function Class() {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const toggleClass = (classId: string) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Class Management</h2>
        <p className="text-sm text-gray-600">
          View and manage your classes and student performance
        </p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {mockClasses.map((classItem) => (
          <Card
            key={classItem.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleClass(classItem.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-1">{classItem.name}</h3>
                  <p className="text-sm text-gray-500">
                    {classItem.totalStudents} students
                  </p>
                </div>
                {expandedClass === classItem.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expanded Class Details */}
      {expandedClass && (
        <Card className="animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle>
              {mockClasses.find((c) => c.id === expandedClass)?.name} - Student
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Quiz Marks</TableHead>
                  <TableHead className="text-right">Viva Marks</TableHead>
                  <TableHead className="text-right">Total Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClasses
                  .find((c) => c.id === expandedClass)
                  ?.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {student.email}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.quizStatus === "pending" ? (
                          <span className="text-red-500 text-sm">Pending</span>
                        ) : (
                          <span
                            className={
                              student.quizMarks > 0
                                ? "text-gray-900"
                                : "text-gray-400"
                            }
                          >
                            {student.quizMarks}/100
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.quizStatus === "pending" ? (
                          <span className="text-red-500 text-sm">Pending</span>
                        ) : (
                          <span
                            className={
                              student.vivaMarks > 0
                                ? "text-gray-900"
                                : "text-gray-400"
                            }
                          >
                            {student.vivaMarks}/100
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.quizStatus === "pending" ? (
                          <span className="text-red-500 text-sm">Pending</span>
                        ) : (
                          <span
                            className={
                              student.totalMarks > 0
                                ? "text-gray-900"
                                : "text-gray-400"
                            }
                          >
                            {student.totalMarks}/200
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
