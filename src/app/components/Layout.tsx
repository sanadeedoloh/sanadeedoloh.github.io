import React from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Calendar, Database } from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Calendar size={20} />
              </div>
              Tech Manpower System
            </h1>
            <div className="flex gap-2">
              <Link
                to="/"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                  location.pathname === '/'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Calendar size={16} strokeWidth={3} />
                ปฏิทิน
              </Link>
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                  location.pathname === '/admin'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Database size={16} strokeWidth={3} />
                แอดมิน
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <Outlet />
    </div>
  );
};
