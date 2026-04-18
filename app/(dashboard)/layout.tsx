"use client";

import { AuthProvider } from "../../components/AuthProvider";

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
