import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Volume2,
  Headphones,
  ChevronDown,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navigation = [
  { name: "My dashboard", path: "/", icon: LayoutDashboard },
  { name: "Class", path: "/class", icon: Users },
  { name: "Quiz Materials", path: "/quiz-materials", icon: BookOpen },
  { name: "Viva Materials", path: "/viva-materials", icon: Volume2 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col">
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
                  ${
                    active
                      ? "bg-red-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Support Button */}
        <div className="p-3">
          <Link
            href="/supports"
            className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Headphones className="w-5 h-5" />
            <span className="text-sm">Supports</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Name of the teacher</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome to our app</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors focus:outline-hidden">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">Hello Name</span>
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
