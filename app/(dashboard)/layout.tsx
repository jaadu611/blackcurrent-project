"use client";

import { AuthProvider } from "../../components/AuthProvider";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Volume2,
  HelpCircle,
  ChevronDown,
  User,
  FileCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const navigation = [
  { name: "My dashboard", path: "/", icon: LayoutDashboard },
  { name: "Class", path: "/class", icon: Users },
  { name: "Quiz Materials", path: "/quiz-materials", icon: BookOpen },
  { name: "Viva Materials", path: "/viva-materials", icon: Volume2 },
  { name: "Checker", path: "/submissions", icon: FileCheck },
  { name: "Assignments", path: "/assignments", icon: BookOpen },
];

function Sidebar({ pathname }: { pathname: string }) {
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <aside className="w-52 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4">
        <div className="w-10 h-10 bg-linear-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-white rounded-full"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors
                ${active
                  ? "bg-red-500 text-white shadow-md shadow-red-200"
                  : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Support Button */}
      <div className="p-3">
        <Link
          href="/supports"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive("/supports")
              ? "bg-red-500 text-white shadow-lg shadow-red-200"
              : "text-gray-500 hover:bg-red-50 hover:text-red-600"
            }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-semibold tracking-tight">Supports</span>
        </Link>
      </div>
    </aside>
  );
}

const MemoizedSidebar = React.memo(Sidebar);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-on-background font-sans overflow-x-hidden">
        {children}
      </div>
    </AuthProvider>
  );
}
