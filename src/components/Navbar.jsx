import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, LogOut, UserCircle, LayoutDashboard, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, role, creatorId, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isPlayer = location.pathname.startsWith('/play/');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-indigo-500/10 p-2 rounded-lg">
              <Code2 className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 hidden sm:block">
              DevMastery
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_12px_rgba(79,70,229,0.25)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> My Courses
                </Link>

                {/* Show creator link if they are a creator */}
                {creatorId ? (
                  <Link to="/creator" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Sparkles className="w-4 h-4" /> Studio
                  </Link>
                ) : (
                  <Link to="/become-creator" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                    Become a Creator
                  </Link>
                )}

                <div className="h-5 w-px bg-zinc-800" />

                {/* User menu */}
                <div className="relative group">
                  <button className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800/50">
                    <UserCircle className="w-6 h-6" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-1">
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> My Learning
                    </Link>
                    {creatorId && (
                      <Link to="/creator" className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors">
                        <Sparkles className="w-4 h-4" /> Creator Studio
                      </Link>
                    )}
                    <div className="border-t border-zinc-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
