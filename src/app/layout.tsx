import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AgentPulse - AI Agent Observability & Workflow Studio",
  description:
    "Next-Gen Autonomous AI Agent Observability, Traces Waterfall, and Interactive Playground Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#08090d] text-slate-100 antialiased font-sans">
        <Sidebar />
        <div className="pl-64 flex flex-col min-h-screen">
          <main className="flex-1 pb-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
