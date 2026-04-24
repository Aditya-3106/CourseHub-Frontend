import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Clock, PlayCircle, Lock, ChevronDown, ChevronUp, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

export default function CourseLanding() {
  const { courseId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);     // { course, sections, hasPurchased }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseMsg, setPurchaseMsg] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError('');
      try {
        // GET /api/course/:id/content → { success, data: { course, sections, hasPurchased } }
        const res = await api.get(`/course/${courseId}/content`);
        setData(res.data.data);
        // expand first section by default
        if (res.data.data.sections?.length) {
          setExpandedSections({ [res.data.data.sections[0].id]: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handlePurchase = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setPurchasing(true);
    setPurchaseMsg('');
    try {
      // POST /api/course/purchase/:id → { success, message }
      await api.post(`/course/purchase/${courseId}`);
      setPurchaseMsg('Purchase successful! Redirecting…');
      setTimeout(() => navigate(`/play/${courseId}`), 1500);
    } catch (err) {
      setPurchaseMsg(err.response?.data?.message || 'Purchase failed.');
    } finally {
      setPurchasing(false);
    }
  };

  const toggleSection = (id) => setExpandedSections((p) => ({ ...p, [id]: !p[id] }));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-6 py-4">
        <AlertCircle className="w-5 h-5" />{error}
      </div>
    </div>
  );

  const { course, sections, hasPurchased } = data || {};
  const totalLectures = sections?.reduce((a, s) => a + (s.lectures?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1 space-y-5">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                Course
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">{course?.title}</h1>
              {course?.description && <p className="text-lg text-zinc-400 leading-relaxed">{course.description}</p>}
              <div className="flex items-center gap-6 text-sm text-zinc-400 flex-wrap">
                <div className="flex items-center gap-2"><PlayCircle className="w-4 h-4 text-indigo-400" />{totalLectures} lectures</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" />{sections?.length || 0} sections</div>
              </div>
            </div>

            {/* Purchase Card */}
            <div className="w-full lg:w-88 glass-card p-7 shadow-2xl flex-shrink-0">
              {course?.thumbnail_url && (
                <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover rounded-lg mb-6 border border-zinc-800" />
              )}
              <div className="text-4xl font-extrabold text-white mb-6">${course?.price}</div>

              {hasPurchased ? (
                <button
                  onClick={() => navigate(`/play/${courseId}`)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" /> Continue Learning
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2"
                >
                  {purchasing && <Loader2 className="w-5 h-5 animate-spin" />}
                  {purchasing ? 'Processing…' : 'Enroll Now'}
                </button>
              )}

              {purchaseMsg && (
                <p className={`mt-3 text-sm text-center ${purchaseMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {purchaseMsg}
                </p>
              )}
              <p className="text-xs text-center text-zinc-500 mt-4">30-Day Money-Back Guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-white mb-8">Course Curriculum</h2>
        <div className="space-y-3">
          {sections?.map((section, idx) => (
            <div key={section.id} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-semibold text-sm">{idx + 1}</div>
                  <div className="text-left">
                    <p className="font-semibold text-zinc-100">{section.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{section.lectures?.length || 0} lectures</p>
                  </div>
                </div>
                {expandedSections[section.id] ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
              </button>
              {expandedSections[section.id] && section.lectures?.length > 0 && (
                <div className="border-t border-zinc-800">
                  {section.lectures.map((lec) => (
                    <div key={lec.id} className="flex items-center gap-4 px-5 py-3 border-b border-zinc-800/50 last:border-0">
                      {lec.is_preview ? (
                        <PlayCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      ) : (
                        hasPurchased
                          ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          : <Lock className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${hasPurchased || lec.is_preview ? 'text-zinc-300' : 'text-zinc-500'}`}>{lec.title}</span>
                      {lec.is_preview && <span className="ml-auto text-xs text-indigo-400 font-medium">Preview</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
