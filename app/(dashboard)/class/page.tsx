"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { ChevronRight, ChevronDown, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

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
    students: [],
  },
  {
    id: "3",
    name: "Biology 102",
    totalStudents: 25,
    students: [],
  },
  {
    id: "4",
    name: "Mathematics 301",
    totalStudents: 30,
    students: [],
  },
  {
    id: "5",
    name: "English Literature",
    totalStudents: 22,
    students: [],
  },
];

export default function Class() {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const toggleClass = (classId: string) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  const activeClass = mockClasses.find((c) => c.id === expandedClass);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Class Management
        </h2>
        <p className="text-sm text-gray-500">
          View and manage your classes and student performance
        </p>
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {mockClasses.map((classItem) => {
          const isActive = expandedClass === classItem.id;

          return (
            <Card
              key={classItem.id}
              onClick={() => toggleClass(classItem.id)}
              className={`cursor-pointer transition-all duration-300 border 
              ${
                isActive
                  ? "border-red-500 shadow-lg bg-white"
                  : "border-gray-200 hover:shadow-md bg-white"
              }`}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900 font-semibold text-lg">
                    {classItem.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {classItem.totalStudents} students
                  </p>
                </div>

                {isActive ? (
                  <ChevronDown className="w-5 h-5 text-red-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table Section */}
      {activeClass && (
        <Card className="border border-gray-200 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader className="bg-gray-100 border-b">
            <CardTitle className="text-gray-900 text-lg font-semibold">
              {activeClass.name} — Student Performance
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold">
                    Student
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Email
                  </TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">
                    Quiz
                  </TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">
                    Viva
                  </TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {activeClass.students.map((student) => (
                  <TableRow
                    key={student.id}
                    className="hover:bg-gray-50 transition"
                  >
                    {/* Name */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {student.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-gray-500 text-sm">
                      {student.email}
                    </TableCell>

                    {/* Quiz */}
                    <TableCell className="text-right">
                      {student.quizStatus === "pending" ? (
                        <span className="text-red-500 font-medium text-sm">
                          Pending
                        </span>
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {student.quizMarks}/100
                        </span>
                      )}
                    </TableCell>

                    {/* Viva */}
                    <TableCell className="text-right">
                      {student.quizStatus === "pending" ? (
                        <span className="text-red-500 font-medium text-sm">
                          Pending
                        </span>
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {student.vivaMarks}/100
                        </span>
                      )}
                    </TableCell>

                    {/* Total */}
                    <TableCell className="text-right">
                      {student.quizStatus === "pending" ? (
                        <span className="text-red-500 font-medium text-sm">
                          Pending
                        </span>
                      ) : (
                        <span className="text-gray-900 font-semibold">
                          {student.totalMarks}/200
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Empty state */}
            {activeClass.students.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm">
                No student data available
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
