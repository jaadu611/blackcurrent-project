"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { BookOpen, Users, FileText, TrendingUp } from "lucide-react";
import ProfileCard from "../../components/ProfileCard";
import EspPushWidget from "../../components/EspPushWidget";

export default function MyDashboard() {
  const stats = [
    {
      label: "Total Materials",
      value: "24",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Quizzes",
      value: "18",
      icon: BookOpen,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Students",
      value: "156",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Completion Rate",
      value: "87%",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-sm text-gray-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">
                  {stat.label}
                </CardTitle>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Profile + ESP32 Push */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileCard />
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

          <EspPushWidget />

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">New quiz created for Physics</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      15 students completed Chemistry quiz
                    </p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      New material uploaded: Biology Chapter 3
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
