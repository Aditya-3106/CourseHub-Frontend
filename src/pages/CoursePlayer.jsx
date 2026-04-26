import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CoursePlayerSkeleton } from '../components/SkeletonLoader';
import VideoArea from '../components/VideoArea';
import MarkdownViewer from '../components/MarkdownViewer';
import {
  CheckCircle2,
  Circle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  BookOpen,
  Loader2,
} from 'lucide-react';

// --- Debounce utility (inline to avoid import issues) ---
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [progress, setProgress] = useState([]); // Array of completed lecture IDs (integers)
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [syllabusOpen, setSyllabusOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // FIXED: Correct endpoint is GET /course/:id/content
        const courseRes = await api.get(`/course/${id}/content`);
        // Response: { success, data: { course, access } }
        const fetchedCourse = courseRes.data.data.course;
        setCourse(fetchedCourse);

        // Auto-select first lecture
        const firstSection = fetchedCourse.sections?.[0];
        const firstLecture = firstSection?.lectures?.[0];
        if (firstLecture) {
          setActiveLecture(firstLecture);
          setExpandedSections({ [firstSection.id]: true });
        }

        // Fetch progress (CORRECT endpoint: GET /progress/course/:id)
        try {
          const progressRes = await api.get(`/progress/course/${id}`);
          // Backend returns: { success, data: { completedLectures: [lectureId, ...] } }
          setProgress(progressRes.data.data.completedLectures || []);
        } catch {
          // Progress may not exist yet for a new enrollment — that's fine
        }
      } catch (err) {
        toast.error('Failed to load course. Redirecting...');
        navigate('/my-learning');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // ─── Mark as Complete (with debounce to avoid spamming) ───────────────────
  const _markComplete = useCallback(
    async (lectureId) => {
      if (progress.includes(lectureId)) return;
      setMarking(true);
      try {
        // FIXED: Correct endpoint is POST /progress/lecture/:id/complete
        await api.post(`/progress/lecture/${lectureId}/complete`);
        setProgress((prev) => [...prev, lectureId]);
        toast.success('Lecture marked as complete!');
      } catch (err) {
        const msg = err.response?.data?.message;
        if (!msg?.includes('already')) {
          toast.error('Failed to mark as complete');
        }
      } finally {
        setMarking(false);
      }
    },
    [progress]
  );

  const markAsComplete = useDebounce(_markComplete, 500);

  // ─── UI Helpers ───────────────────────────────────────────────────────────
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const selectLecture = (lecture, sectionId) => {
    setActiveLecture(lecture);
    setSyllabusOpen(false);
    setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
  };

  const totalLectures = course?.sections?.reduce(
    (acc, s) => acc + (s.lectures?.length || 0),
    0
  ) ?? 0;

  const progressPercent = totalLectures > 0
    ? Math.round((progress.length / totalLectures) * 100)
    : 0;

  const isCompleted = activeLecture ? progress.includes(activeLecture.id) : false;

  if (loading) return <CoursePlayerSkeleton />;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
      <div className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center gap-4 sticky top-16 z-40">
        <button
          onClick={() => navigate('/my-learning')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">My Learning</span>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm sm:text-base truncate">{course?.title}</h1>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400">{progressPercent}%</span>
          </div>

          {/* Syllabus Toggle Button (no sidebar — uses drawer) */}
          <button
            onClick={() => setSyllabusOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Syllabus</span>
            {syllabusOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Syllabus Drawer (top-aligned, no sidebar) ──────────────────────── */}
      {syllabusOpen && (
        <div className="bg-zinc-900 border-b border-zinc-800 max-h-80 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="space-y-2">
              {course?.sections?.map((section, sIdx) => {
                const isExpanded = expandedSections[section.id] !== false;
                return (
                  <div key={section.id} className="border border-zinc-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
                    >
                      <span className="font-medium text-zinc-200 text-sm">
                        {sIdx + 1}. {section.title}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500">{section.lectures?.length || 0} lectures</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-zinc-950">
                        {section.lectures?.map((lecture, lIdx) => {
                          const isActive = activeLecture?.id === lecture.id;
                          const isDone = progress.includes(lecture.id);
                          return (
                            <button
                              key={lecture.id}
                              onClick={() => selectLecture(lecture, section.id)}
                              className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                                isActive
                                  ? 'bg-indigo-500/10 border-l-2 border-indigo-500'
                                  : 'hover:bg-zinc-900/60 border-l-2 border-transparent'
                              }`}
                            >
                              <span className="flex-shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-600" />
                                )}
                              </span>
                              <span className={`text-sm flex-1 ${isActive ? 'text-indigo-400 font-medium' : 'text-zinc-300'}`}>
                                {lIdx + 1}. {lecture.title}
                              </span>
                              {lecture.video_url ? (
                                <PlayCircle className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {activeLecture ? (
          <>
            {/* Video Player (full width, no sidebar) */}
            {activeLecture.video_url && <VideoArea videoUrl={activeLecture.video_url} />}

            <div className="max-w-4xl w-full mx-auto p-6 lg:p-8">
              {/* Lecture Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{activeLecture.title}</h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    {activeLecture.video_url ? 'Video Lecture' : 'Reading'}
                  </p>
                </div>

                <button
                  onClick={() => markAsComplete(activeLecture.id)}
                  disabled={isCompleted || marking}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all flex-shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Completed
                    </>
                  ) : marking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Marking...
                    </>
                  ) : (
                    'Mark as Complete'
                  )}
                </button>
              </div>

              {/* Inline Syllabus Accordion (always visible below content, no sidebar) */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Course Content</h3>
                <div className="space-y-2">
                  {course?.sections?.map((section, sIdx) => {
                    const isExpanded = expandedSections[section.id] !== false;
                    return (
                      <div key={section.id} className="border border-zinc-800 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full px-5 py-3.5 flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-800/60 transition-colors text-left"
                        >
                          <span className="font-semibold text-zinc-200 text-sm">
                            {sIdx + 1}. {section.title}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-500">{section.lectures?.length || 0} lectures</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-zinc-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="divide-y divide-zinc-800/40">
                            {section.lectures?.map((lecture, lIdx) => {
                              const isActive = activeLecture?.id === lecture.id;
                              const isDone = progress.includes(lecture.id);
                              return (
                                <button
                                  key={lecture.id}
                                  onClick={() => setActiveLecture(lecture)}
                                  className={`w-full px-5 py-3 flex items-center gap-3 text-left transition-colors ${
                                    isActive
                                      ? 'bg-indigo-500/10 border-l-2 border-indigo-500'
                                      : 'hover:bg-zinc-900/40 border-l-2 border-transparent'
                                  }`}
                                >
                                  <span className="flex-shrink-0">
                                    {isDone ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-zinc-600" />
                                    )}
                                  </span>
                                  <span className={`text-sm flex-1 ${isActive ? 'text-indigo-400 font-medium' : 'text-zinc-300'}`}>
                                    {lIdx + 1}. {lecture.title}
                                  </span>
                                  {lecture.video_url ? (
                                    <PlayCircle className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lecture Notes */}
              <MarkdownViewer content={activeLecture.content} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center py-32 text-zinc-500">
            <div className="text-center">
              <PlayCircle className="w-14 h-14 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a lecture from the syllabus to begin.</p>
              <button
                onClick={() => setSyllabusOpen(true)}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm"
              >
                Open Syllabus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
