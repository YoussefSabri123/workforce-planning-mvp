import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "WorkforceNexus AI",
  description: "AI Workforce Planning Workspace",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <div className="min-h-screen bg-slate-950">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
              <div className="min-w-0">
                <a
                  href="/"
                  className="block truncate text-lg font-semibold tracking-tight text-white transition hover:text-cyan-300"
                >
                  WorkforceNexus AI
                </a>
                <p className="text-xs text-slate-400">Workforce Planning MVP</p>
              </div>

              <nav className="flex items-center gap-2">
                <a
                  href="/"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Home
                </a>

                <a
                  href="/projects"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Projects
                </a>

                <a
                  href="/projects/new"
                  className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  New Project
                </a>
              </nav>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
