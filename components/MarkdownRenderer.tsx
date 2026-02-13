import React from 'react';
import ReactMarkdown from 'react-markdown';
import ReactSyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Mermaid from './Mermaid';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert prose-blue max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language === 'mermaid') {
                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
            }

            return !inline && match ? (
              <ReactSyntaxHighlighter
                style={atomOneDark}
                language={language}
                PreTag="div"
                customStyle={{
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    margin: '1.5rem 0'
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </ReactSyntaxHighlighter>
            ) : (
              <code className={`${className} bg-surface px-1.5 py-0.5 rounded text-sm text-sky-300 font-mono`} {...props}>
                {children}
              </code>
            );
          },
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mb-6 mt-8 border-b border-white/10 pb-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-white mb-4 mt-8 flex items-center" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-medium text-gray-100 mb-3 mt-6" {...props} />,
          p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4 text-base" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-300" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/50 bg-primary/5 pl-4 py-2 italic text-gray-400 rounded-r my-6" {...props} />,
          a: ({node, ...props}) => <a className="text-primary hover:text-accent underline underline-offset-2 transition-colors" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;