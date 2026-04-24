import React from 'react';
import Markdown from 'react-markdown';

export default function MarkdownViewer({ content }) {
  if (!content) {
    return (
      <div className="text-zinc-500 italic">No notes available for this lecture.</div>
    );
  }

  return (
    <div className="prose prose-invert prose-indigo max-w-none">
      <Markdown>{content}</Markdown>
    </div>
  );
}
