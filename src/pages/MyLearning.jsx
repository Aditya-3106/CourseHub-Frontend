import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { optimizeImageUrl } from '../utils/cloudinary';
import { CourseCardSkeleton } from '../components/SkeletonLoader';
import { PlayCircle, BookOpen, Clock, BarChart3 } from 'lucide-react';

export default function MyLearning() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        // FIXED: Correct endpoint is /user/me/courses
        const res = await api.get('/user/me/courses');
        // Backend returns: { success: true, data: { courses } }
        setCourses(res.data.data.courses || []);
      } catch (err) {
        setError('Failed to load your courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-zinc-950">
      {/* Page Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-1">My Learning</h1>
          <p className="text-zinc-400">Continue where you left off and level up your skills.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <Link
                key={course.id}
                to={`/play/${course.id}`}
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
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-zinc-950/40 backdrop-blur-sm">
                    <PlayCircle className="w-16 h-16 text-indigo-500 drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                  )}
                  <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-indigo-400 font-medium text-sm">
                    <PlayCircle className="w-4 h-4" />
                    Continue Learning
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-24 text-center glass-card border border-zinc-800/60">
              <BookOpen className="w-14 h-14 text-zinc-700 mx-auto mb-5" />
              <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
              <p className="text-zinc-400 mb-6">Explore our catalog and start building real-world applications.</p>
              <Link
                to="/"
                className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Explore Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
