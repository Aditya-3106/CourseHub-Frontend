import React from 'react';
import Markdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

/**
 * Renders markdown content with XSS protection via rehype-sanitize.
 */
export default function MarkdownViewer({ content }) {
  if (!content) {
    return (
      <div className="text-zinc-500 italic text-sm">No notes available for this lecture.</div>
    );
  }

  return (
    <div className="prose-content">
      <Markdown rehypePlugins={[rehypeSanitize]}>
        {content}
      </Markdown>
    </div>
  );
}
