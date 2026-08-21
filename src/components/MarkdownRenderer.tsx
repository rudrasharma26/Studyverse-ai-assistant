import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-invert max-w-none space-y-3 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-slate-100 mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-indigo-300 mt-4 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-sky-300 mt-3 mb-1.5">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-semibold text-slate-200 mt-2 mb-1">{children}</h4>,
          p: ({ children }) => <p className="text-slate-300 text-sm leading-relaxed mb-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-sm mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 text-slate-300 text-sm mb-3">{children}</ol>,
          li: ({ children }) => <li className="text-slate-300 leading-normal">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
          em: ({ children }) => <em className="text-slate-200 italic">{children}</em>,
          code: ({ children }) => (
            <code className="bg-slate-800/80 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700/50">
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-slate-800 bg-slate-900/60">
              <table className="min-w-full text-left text-sm text-slate-300 divide-y divide-slate-800">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-800/80 text-xs uppercase text-slate-300 font-semibold">{children}</thead>,
          th: ({ children }) => <th className="px-4 py-2.5 text-slate-200">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2.5 border-t border-slate-800/60 text-slate-300">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500/80 bg-indigo-950/20 pl-4 py-2 my-3 text-slate-300 italic rounded-r">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
