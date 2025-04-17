import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Sidebar - cachée en mobile */}
      <div className="hidden lg:block">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>
      
      {/* Contenu principal - pleine largeur en mobile */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
} 