import { ReactNode } from "react";
import { Redirect } from "wouter";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { getStoredAuthUser } from "@/lib/session";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const user = getStoredAuthUser();

  if (!user || user.role !== "admin") {
    return <Redirect to="/admin/login" />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
