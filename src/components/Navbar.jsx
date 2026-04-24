import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-white hover:text-indigo-400 transition-colors">
              <Code2 className="w-8 h-8 text-indigo-500" />
              <span className="font-bold text-xl tracking-tight">100xdevs<span className="text-indigo-500">.clone</span></span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/my-learning" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">
                  My Learning
                </Link>
                <div className="h-6 w-px bg-zinc-800 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
