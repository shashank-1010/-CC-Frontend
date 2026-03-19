import { useState } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function DashboardLayout({ children, title, subtitle, action }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content area */}
      <div className="lg:ml-60 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 h-14 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {title && (
              <div>
                <h1 className="text-base font-semibold text-slate-800">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500 leading-none mt-0.5">{subtitle}</p>}
              </div>
            )}
          </div>
          {action && <div>{action}</div>}
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}










