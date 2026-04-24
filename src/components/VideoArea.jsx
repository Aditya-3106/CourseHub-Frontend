import React from 'react';
import { Video } from 'lucide-react';

export default function VideoArea({ videoUrl }) {
  if (!videoUrl) {
    return (
      <div className="w-full aspect-video bg-zinc-900 border-b border-zinc-800 flex flex-col items-center justify-center text-zinc-500">
        <Video className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">No video available for this lecture</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black border-b border-zinc-800 relative">
      <iframe
        src={videoUrl}
        title="Course Video Player"
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}
