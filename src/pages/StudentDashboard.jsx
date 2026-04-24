import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { PlayCircle, Code, Loader2, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        // GET /api/user/me/courses → { success, data: { courses } }
        const res = await api.get('/user/me/courses');
        setCourses(res.data.data.courses || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">My Learning</h1>
        <p className="text-zinc-400 mt-1">Your enrolled courses — pick up where you left off.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <p className="text-zinc-500 text-lg">You haven't enrolled in any courses yet.</p>
          <Link to="/" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all">
            Browse Courses
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="glass-card overflow-hidden group flex flex-col">
            <div className="aspect-video relative overflow-hidden border-b border-zinc-800/50 bg-zinc-800">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Code className="w-10 h-10 text-zinc-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link to={`/play/${course.id}`} className="w-12 h-12 rounded-full bg-indigo-600/90 flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-transform shadow-lg">
                  <PlayCircle className="w-6 h-6 text-white ml-0.5" />
                </Link>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-white mb-4 line-clamp-2">{course.title}</h3>
              <div className="mt-auto">
                <Link
                  to={`/play/${course.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 rounded-lg font-medium transition-colors text-sm"
                >
                  <PlayCircle className="w-4 h-4" /> Continue Learning
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
