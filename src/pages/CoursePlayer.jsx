import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CoursePlayerSkeleton } from '../components/SkeletonLoader';
import VideoArea from '../components/VideoArea';
import SyllabusSidebar from '../components/SyllabusSidebar';
import MarkdownViewer from '../components/MarkdownViewer';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [progress, setProgress] = useState([]); // Array of completed lecture IDs
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get(`/course/${id}`);
        const fetchedCourse = courseRes.data.data.course;
        setCourse(fetchedCourse);
        
        // Auto-select first lecture if exists
        if (fetchedCourse.sections?.length > 0 && fetchedCourse.sections[0].lectures?.length > 0) {
          setActiveLecture(fetchedCourse.sections[0].lectures[0]);
        }

        // Fetch progress
        try {
          const progressRes = await api.get(`/progress/course/${id}`);
          setProgress(progressRes.data.data.completedLectures || []);
        } catch (e) {
          console.warn("Could not fetch progress, might not be started yet.");
        }
      } catch (err) {
        toast.error('Failed to load course player');
        navigate('/my-learning');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: prev[sectionId] === false ? true : false
    }));
  };

  const markAsComplete = async () => {
    if (!activeLecture || progress.includes(activeLecture._id)) return;
    
    setMarking(true);
    try {
      await api.post(`/progress/${activeLecture._id}`);
      setProgress([...progress, activeLecture._id]);
      toast.success('Lecture marked as complete!');
    } catch (err) {
      toast.error('Failed to mark as complete');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return <CoursePlayerSkeleton />;
  }

  const isCompleted = activeLecture ? progress.includes(activeLecture._id) : false;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pt-16">
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          
          <div className="bg-zinc-950 px-4 py-3 flex items-center border-b border-zinc-800">
            <button onClick={() => navigate('/my-learning')} className="text-zinc-400 hover:text-white mr-4 flex items-center gap-2 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Learning
            </button>
            <h1 className="text-white font-semibold truncate">{course?.title}</h1>
          </div>

          {activeLecture ? (
            <>
              {/* Video Player */}
              {activeLecture.videoUrl && <VideoArea videoUrl={activeLecture.videoUrl} />}
              
              <div className="max-w-4xl w-full mx-auto p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{activeLecture.title}</h2>
                  <button
                    onClick={markAsComplete}
                    disabled={isCompleted || marking}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                      isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Completed
                      </>
                    ) : (
                      <>
                        {marking ? 'Marking...' : 'Mark as Complete'}
                      </>
                    )}
                  </button>
                </div>
                
                {/* Notes/Markdown Area */}
                <MarkdownViewer content={activeLecture.content} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              <p>Select a lecture from the sidebar to begin.</p>
            </div>
          )}
        </div>

        {/* Syllabus Sidebar */}
        <SyllabusSidebar 
          sections={course?.sections} 
          activeLecture={activeLecture} 
          setActiveLecture={setActiveLecture} 
          progress={progress} 
          expandedSections={expandedSections} 
          toggleSection={toggleSection} 
        />
        
      </div>
    </div>
  );
}
