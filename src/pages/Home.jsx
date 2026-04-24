import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Play, Code, Zap, Trophy, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

function CourseCard({ course }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden group flex flex-col hover:border-indigo-500/30 transition-colors"
    >
      <div className="aspect-video relative overflow-hidden border-b border-zinc-800/50 bg-zinc-800">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Code className="w-10 h-10 text-zinc-600" />
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-white mb-2 line-clamp-2 leading-snug">{course.title}</h3>
        {course.description && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{course.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-400">${course.price}</span>
          <Link
            to={`/course/${course.id}`}
            className="text-sm bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            View Course
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      // GET /api/course?page=N&limit=9 → { success, data: { courses, pagination } }
      const res = await api.get('/course', { params: { page, limit: 9 } });
      setCourses(res.data.data.courses);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError('Failed to load courses. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(1); }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden pt-24 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-[100px] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Master Modern Web
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Development</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
              Premium, distraction-free courses built for developers. Real code. Real projects.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                Start Learning Free
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 glass-card hover:bg-zinc-800/50 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
                Log In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: <Code className="w-7 h-7 text-indigo-400" />, title: 'Code-First Approach', desc: 'Less theory, more building. Every lesson ships real, runnable code.' },
            { icon: <Zap className="w-7 h-7 text-indigo-400" />, title: 'Fast & Distraction-Free', desc: 'Our custom player is built specifically for developers. No fluff.' },
            { icon: <Trophy className="w-7 h-7 text-indigo-400" />, title: 'Verified Certificates', desc: 'Showcase your skills with verified completion certificates.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-7">
              <div className="bg-zinc-800/50 w-14 h-14 rounded-xl flex items-center justify-center mb-5">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Browse Courses</h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-24 text-zinc-500">No published courses yet. Check back soon!</div>
        )}

        {!loading && !error && courses.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => fetchCourses(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="flex items-center gap-1 px-4 py-2 glass-card hover:bg-zinc-800/50 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-zinc-400 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchCourses(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="flex items-center gap-1 px-4 py-2 glass-card hover:bg-zinc-800/50 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
