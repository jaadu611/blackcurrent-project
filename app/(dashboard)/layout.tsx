"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
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
  Menu,
  X,
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

function Sidebar({
  pathname,
  collapsed,
  onToggle,
}: {
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-52"} bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300`}
    >
      {/* Logo & Toggle */}
      <div className="p-4 flex items-center justify-between">
        <div className="w-10 h-10 bg-linear-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-white rounded-full"></div>
        </div>
        <button
          onClick={onToggle}
          className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors ${collapsed ? "hidden" : ""}`}
          aria-label="Toggle sidebar"
        >
          <X className="w-4 h-4 text-black" />
        </button>
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
                ${
                  active
                    ? "bg-red-500 text-white shadow-md shadow-red-200"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Support Button */}
      <div className="p-3">
        <Link
          href="/supports"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
            isActive("/supports")
              ? "bg-red-500 text-white shadow-lg shadow-red-200"
              : "text-gray-500 hover:bg-red-50 hover:text-red-600"
          }`}
          title={collapsed ? "Supports" : undefined}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">
              Supports
            </span>
          )}
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
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="flex h-svh bg-gray-50 overflow-hidden">
      <MemoizedSidebar
        pathname={pathname}
        collapsed={collapsed}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-gray-900 font-extrabold text-lg tracking-tight">
                {user ? user.fullName : "Teacher Dashboard"}
              </h1>
              <p className="text-xs font-medium text-gray-400 mt-0.5 uppercase tracking-widest">
                {user ? user.institute : "Welcome"}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors focus:outline-hidden">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">
                {user ? user.fullName.split(" ")[0] : "User"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600 font-bold"
                onClick={logout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50/50">{children}</main>
      </div>
    </div>
  );
}
