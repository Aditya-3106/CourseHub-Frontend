import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Edit3, Eye, Users, BookOpen, Loader2, AlertCircle, Code } from 'lucide-react';

export default function CreatorDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // GET /api/creator/dashboard → { success, data: { courses, ... } }
        const res = await api.get('/creator/dashboard');
        setDashboard(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  const courses = dashboard?.courses || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Creator Dashboard</h1>
          <p className="text-zinc-400 mt-1">Manage your courses and track your students.</p>
        </div>
        <Link
          to="/creator/course/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]"
        >
          <Plus className="w-5 h-5" /> Create New Course
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
        </div>
      )}

      {!error && courses.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <p className="text-zinc-500 text-lg">You haven't created any courses yet.</p>
          <Link to="/creator/course/new" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all">
            Create Your First Course
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="glass-card overflow-hidden flex flex-col group">
            <div className="aspect-video relative overflow-hidden border-b border-zinc-800/50 bg-zinc-800">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Code className="w-10 h-10 text-zinc-600" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                  course.is_published
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {course.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-white mb-4 line-clamp-2">{course.title}</h3>
              <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1"><Users className="w-3.5 h-3.5" /> Students</div>
                  <div className="font-semibold text-white">{course.student_count ?? '—'}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1"><BookOpen className="w-3.5 h-3.5" /> Price</div>
                  <div className="font-semibold text-white">${course.price}</div>
                </div>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2 border-t border-zinc-800/50 pt-4">
                <Link to={`/creator/course/${course.id}`} className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-zinc-300 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" /> Edit
                </Link>
                <Link to={`/course/${course.id}`} className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" /> View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
