import React from 'react';
import { CheckCircle2, Circle, PlayCircle, FileText } from 'lucide-react';

export default function SyllabusSidebar({ 
  sections, 
  activeLecture, 
  setActiveLecture, 
  progress, 
  expandedSections, 
  toggleSection 
}) {
  return (
    <div className="w-full lg:w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <h2 className="font-bold text-white tracking-tight">Course Content</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sections?.map((section, sIdx) => {
          const isExpanded = expandedSections[section._id] !== false; // default true
          
          return (
            <div key={section._id} className="border-b border-zinc-800/50">
              <button
                onClick={() => toggleSection(section._id)}
                className="w-full px-4 py-4 flex items-center justify-between bg-zinc-900/30 hover:bg-zinc-800/30 transition-colors text-left"
              >
                <span className="font-semibold text-zinc-200 text-sm">
                  Section {sIdx + 1}: {section.title}
                </span>
                <span className="text-zinc-500 text-xs">
                  {section.lectures?.length || 0} lectures
                </span>
              </button>
              
              {isExpanded && (
                <div className="bg-zinc-950">
                  {section.lectures?.map((lecture, lIdx) => {
                    const isActive = activeLecture?._id === lecture._id;
                    const isCompleted = progress.includes(lecture._id);
                    
                    return (
                      <button
                        key={lecture._id}
                        onClick={() => setActiveLecture(lecture)}
                        className={`w-full px-4 py-3 flex items-start gap-3 transition-colors text-left ${
                          isActive 
                            ? 'bg-indigo-500/10 border-l-2 border-indigo-500' 
                            : 'hover:bg-zinc-900/50 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${isActive ? 'text-indigo-400 font-medium' : 'text-zinc-300'}`}>
                            {lIdx + 1}. {lecture.title}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
                            {lecture.videoUrl ? (
                              <PlayCircle className="w-3 h-3" />
                            ) : (
                              <FileText className="w-3 h-3" />
                            )}
                            <span>{lecture.videoUrl ? 'Video' : 'Article'}</span>
                          </div>
                        </div>
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
  );
}
