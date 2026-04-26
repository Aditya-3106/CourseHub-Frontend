import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { optimizeImageUrl } from '../utils/cloudinary';
import { CourseCardSkeleton } from '../components/SkeletonLoader';
import { ArrowRight, Code, Terminal, Zap, BookOpen } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/course');
        // Backend returns: { success, data: { courses, pagination } }
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
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Production-grade learning
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Build real apps with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                CourseHub
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-zinc-400 mb-10">
              The premium, developer-centric platform to master modern full-stack development. Skip tutorials, build production systems.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#courses"
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-2"
              >
                Explore Courses <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Terminal, color: 'text-indigo-400', title: 'Modern Tech Stack', desc: 'React, Node.js, Next.js, PostgreSQL, and more.' },
              { icon: Code, color: 'text-cyan-400', title: 'Project Based', desc: 'Build real-world apps — not toy examples.' },
              { icon: Zap, color: 'text-emerald-400', title: 'Fast Paced', desc: 'Optimized for developers who want to move fast.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="glass-card p-6 flex flex-col items-center text-center">
                <Icon className={`w-10 h-10 ${color} mb-4`} />
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-zinc-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Available Courses</h2>
              <p className="text-zinc-500 mt-1 text-sm">Handcrafted learning paths for serious developers</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-center mb-8">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="group bg-zinc-900/40 rounded-xl overflow-hidden border border-zinc-800/50 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(79,70,229,0.15)] flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden bg-zinc-900">
                    {course.thumbnail_url ? (
                      <img
                        src={optimizeImageUrl(course.thumbnail_url)}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-6 line-clamp-2 flex-1">
                      {course.description || 'A premium course to level up your development skills.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                      <span className="text-2xl font-bold text-white">
                        ₹{course.price}
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
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No courses available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
