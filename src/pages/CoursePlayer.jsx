import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, ChevronUp, CheckCircle, Circle, Menu, X, Loader2, AlertCircle, Check } from 'lucide-react';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const { isAuthenticated } = useAuth();

  const [courseData, setCourseData] = useState(null);
  const [progress, setProgress] = useState({ completedLectures: [] });
  const [activeLecture, setActiveLecture] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingDone, setMarkingDone] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        // GET /api/course/:id/content → { data: { course, sections:[{id,title,lectures:[{id,title,video_url,is_preview}]}], hasPurchased } }
        const [contentRes, progressRes] = await Promise.all([
          api.get(`/course/${courseId}/content`),
          isAuthenticated ? api.get(`/progress/course/${courseId}`) : Promise.resolve({ data: { data: { completedLectures: [] } } }),
        ]);

        const data = contentRes.data.data;
        setCourseData(data);
        setProgress(progressRes.data.data);

        // Auto-select first lecture
        const firstSection = data.sections?.[0];
        const firstLecture = firstSection?.lectures?.[0];
        if (firstLecture) {
          setActiveLecture(firstLecture);
          setExpandedSections({ [firstSection.id]: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course content.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [courseId]);

  const selectLecture = (lecture, sectionId) => {
    setActiveLecture(lecture);
    setExpandedSections((p) => ({ ...p, [sectionId]: true }));
    if (videoRef.current) videoRef.current.load();
  };

  const toggleSection = (id) => setExpandedSections((p) => ({ ...p, [id]: !p[id] }));

  const isCompleted = (lectureId) => progress.completedLectures?.includes(lectureId);

  const markComplete = async () => {
    if (!activeLecture || markingDone) return;
    setMarkingDone(true);
    try {
      // POST /api/progress/lecture/:id/complete → { success, data }
      await api.post(`/progress/lecture/${activeLecture.id}/complete`);
      setProgress((p) => ({
        ...p,
        completedLectures: [...(p.completedLectures || []), activeLecture.id],
      }));
    } catch {
      // silently fail
    } finally {
      setMarkingDone(false);
    }
  };

  // Progress percentage
  const totalLectures = courseData?.sections?.reduce((a, s) => a + (s.lectures?.length || 0), 0) || 0;
  const completedCount = progress.completedLectures?.length || 0;
  const progressPct = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] px-4">
      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-6 py-4">
        <AlertCircle className="w-5 h-5" /> {error}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-zinc-950 relative">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Progress Bar (top of player area) */}
        <div className="bg-zinc-900/60 border-b border-zinc-800 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs font-medium text-zinc-400 whitespace-nowrap">{completedCount}/{totalLectures} lectures · {progressPct}%</span>
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Video */}
        <div className="w-full bg-black aspect-video flex-shrink-0">
          {activeLecture?.video_url ? (
            <video ref={videoRef} key={activeLecture.id} controls className="w-full h-full" controlsList="nodownload">
              <source src={activeLecture.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
              <Circle className="w-14 h-14 mb-3" />
              <p className="text-sm">No video uploaded for this lecture yet.</p>
            </div>
          )}
        </div>

        {/* Notes area */}
        <div className="max-w-4xl mx-auto w-full px-6 py-10 pb-24">
          <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{activeLecture?.title || 'Select a Lecture'}</h1>
              <p className="text-sm text-zinc-500">{courseData?.course?.title}</p>
            </div>
            {isAuthenticated && !isCompleted(activeLecture?.id) && (
              <button
                onClick={markComplete}
                disabled={markingDone || !activeLecture}
                className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
              >
                {markingDone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Mark as Complete
              </button>
            )}
            {isAuthenticated && isCompleted(activeLecture?.id) && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle className="w-5 h-5" /> Completed
              </div>
            )}
          </div>

          {/* Styled code block example */}
          {activeLecture && (
            <div className="prose prose-invert max-w-none">
              <p className="text-zinc-400 text-base leading-relaxed mb-6">
                Lecture notes will appear here. As you build out your course, you can render rich markdown content per lecture.
              </p>
              <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                <div className="flex items-center px-4 py-2 border-b border-zinc-800 bg-zinc-950/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="ml-4 text-xs font-medium text-zinc-500">example.js</span>
                </div>
                <pre className="p-5 overflow-x-auto text-sm font-mono text-zinc-300 leading-relaxed">
                  <code>{`// Lecture: ${activeLecture.title}
// Add your notes and code snippets here.

console.log("Happy coding!");`}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0'} flex-shrink-0 bg-zinc-900 border-l border-zinc-800 flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex-shrink-0">
          <h2 className="font-bold text-white text-sm">Course Content</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {courseData?.sections?.map((section) => (
            <div key={section.id} className="border-b border-zinc-800">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-zinc-800/50 transition-colors"
              >
                <span className="font-semibold text-sm text-zinc-200 text-left leading-snug">{section.title}</span>
                {expandedSections[section.id] ? <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />}
              </button>
              {expandedSections[section.id] && (
                <div className="bg-zinc-950">
                  {section.lectures?.map((lec) => {
                    const active = activeLecture?.id === lec.id;
                    const done = isCompleted(lec.id);
                    return (
                      <button
                        key={lec.id}
                        onClick={() => selectLecture(lec, section.id)}
                        className={`w-full flex gap-3 items-start px-4 py-3.5 text-left border-l-2 transition-colors ${active ? 'border-indigo-500 bg-indigo-500/5' : 'border-transparent hover:bg-zinc-900'}`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {done ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <div className={`w-4 h-4 rounded-full border-2 ${active ? 'border-indigo-500' : 'border-zinc-700'}`} />
                          )}
                        </div>
                        <span className={`text-sm leading-snug ${active ? 'text-white font-medium' : 'text-zinc-400'}`}>{lec.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
