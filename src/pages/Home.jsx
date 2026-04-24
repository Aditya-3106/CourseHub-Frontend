import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { CourseCardSkeleton } from '../components/SkeletonLoader';
import { ArrowRight, Code, Terminal, Zap } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/course');
        setCourses(res.data.data.courses || []);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen pt-16 bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Master coding with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">100xdevs.clone</span>
            </h1>
            <p className="text-lg lg:text-xl text-zinc-400 mb-10">
              The premium, developer-centric platform to learn building production-ready applications. Skip the basics, build the real deal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#courses" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-2">
                Explore Courses <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-zinc-400">
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <Terminal className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Modern Tech Stack</h3>
              <p className="text-sm">Learn React, Node.js, Next.js, and more.</p>
            </div>
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <Code className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Project Based</h3>
              <p className="text-sm">Build real-world apps, not just to-do lists.</p>
            </div>
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <Zap className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Fast Paced</h3>
              <p className="text-sm">Optimized for developers who want to move fast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white tracking-tight">Available Courses</h2>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <Link
                  key={course._id}
                  to={`/course/${course._id}`}
                  className="group bg-zinc-900/40 rounded-xl overflow-hidden border border-zinc-800/50 hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(79,70,229,0.15)] flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden bg-zinc-900">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Code className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60"></div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-6 line-clamp-2 flex-1">
                      {course.description || "A premium course to level up your development skills."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                      <span className="text-2xl font-bold text-white">
                        ${course.price}
                      </span>
                      <span className="text-indigo-400 font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View Details <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-zinc-500">
                <p className="text-lg">No courses available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
