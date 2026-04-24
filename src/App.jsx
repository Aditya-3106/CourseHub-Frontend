import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CourseLanding from './pages/CourseLanding';
import StudentDashboard from './pages/StudentDashboard';
import CoursePlayer from './pages/CoursePlayer';
import BecomeCreator from './pages/BecomeCreator';
import CreatorDashboard from './pages/CreatorDashboard';
import CourseEditor from './pages/CourseEditor';

// ─── Protected Route Guards ──────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RequireCreator({ children }) {
  const { isAuthenticated, creatorId } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!creatorId) return <Navigate to="/become-creator" replace />;
  return children;
}

function RedirectIfAuthed({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// ─── App Shell ───────────────────────────────────────────────────────────────
function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/course/:courseId" element={<CourseLanding />} />

          {/* Auth — redirect if already logged in */}
          <Route path="/login"  element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
          <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />

          {/* Authenticated student routes */}
          <Route path="/dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
          <Route path="/play/:courseId" element={<RequireAuth><CoursePlayer /></RequireAuth>} />

          {/* Creator onboarding */}
          <Route path="/become-creator" element={<RequireAuth><BecomeCreator /></RequireAuth>} />

          {/* Creator-only routes */}
          <Route path="/creator" element={<RequireCreator><CreatorDashboard /></RequireCreator>} />
          <Route path="/creator/course/:courseId" element={<RequireCreator><CourseEditor /></RequireCreator>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
