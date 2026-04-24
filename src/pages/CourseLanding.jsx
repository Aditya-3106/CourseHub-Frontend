import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PlayCircle, Lock, CheckCircle2, ArrowRight, Loader2, Video, FileText } from 'lucide-react';

export default function CourseLanding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await api.get(`/course/${id}`);
        setCourse(res.data.data.course);
      } catch (err) {
        setError('Failed to load course details. It might not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to purchase this course');
      navigate('/login');
      return;
    }
    
    setPurchasing(true);
    try {
      await api.post(`/course/${id}/purchase`);
      toast.success('Course purchased successfully!');
      navigate(`/play/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to purchase course');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-zinc-950 flex flex-col items-center">
        {/* Skeleton */}
        <div className="w-full bg-zinc-900 border-b border-zinc-800 animate-pulse h-80"></div>
        <div className="max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 py-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 bg-zinc-900 rounded w-1/3 animate-pulse"></div>
            <div className="h-32 bg-zinc-900 rounded animate-pulse"></div>
          </div>
          <div className="h-64 bg-zinc-900 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen pt-24 bg-zinc-950 flex items-center justify-center">
        <div className="text-center text-zinc-400">
          <p className="text-xl">{error || 'Course not found'}</p>
          <button onClick={() => navigate('/')} className="mt-4 text-indigo-400 hover:text-indigo-300">
            Go back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-16">
      {/* Hero Banner */}
      <div className="bg-zinc-900 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-transparent z-10"></div>
        {course.thumbnail && (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30 blur-sm"
          />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
              {course.description || "Take your development skills to the next level with this comprehensive, project-based course. Built for developers who want to write production-grade code."}
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-300 font-medium">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-indigo-500" />
                <span>Premium Video Content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Lifetime Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Course Syllabus</h2>
            <div className="space-y-4">
              {course.sections?.length > 0 ? (
                course.sections.map((section, idx) => (
                  <div key={section._id} className="glass-card border border-zinc-800/60 overflow-hidden">
                    <div className="bg-zinc-900/80 px-6 py-4 flex items-center justify-between">
                      <h3 className="font-semibold text-white">Section {idx + 1}: {section.title}</h3>
                    </div>
                    <div className="divide-y divide-zinc-800/50">
                      {section.lectures?.map((lecture, lIdx) => (
                        <div key={lecture._id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                          <div className="flex items-center gap-3">
                            {lecture.videoUrl ? (
                              <Video className="w-4 h-4 text-zinc-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-zinc-500" />
                            )}
                            <span className="text-sm text-zinc-300">{lIdx + 1}. {lecture.title}</span>
                          </div>
                          <Lock className="w-4 h-4 text-zinc-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card p-8 text-center text-zinc-500">
                  <p>Syllabus is being updated. Check back soon!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Checkout Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 glass-card p-6 border-zinc-800/80 shadow-2xl">
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">${course.price}</span>
              </div>
              
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] mb-4"
              >
                {purchasing ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                {purchasing ? 'Processing...' : 'Buy Now'}
              </button>

              <div className="space-y-4 pt-4 border-t border-zinc-800/50 text-sm text-zinc-400">
                <div className="flex items-center justify-between">
                  <span>Course length</span>
                  <span className="text-white font-medium">Self-paced</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Access</span>
                  <span className="text-white font-medium">Lifetime</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Certificate</span>
                  <span className="text-white font-medium">Included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
