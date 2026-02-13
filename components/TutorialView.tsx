import React, { useState, useEffect } from 'react';
import { TutorialState } from '../types';
import Sidebar from './Sidebar';
import MarkdownRenderer from './MarkdownRenderer';
import { IconMenu, IconLoader, IconBook } from './Icons';
import { generateChapterContent } from '../services/gemini';
import { fetchFileContent } from '../services/github';

interface TutorialViewProps {
  state: TutorialState;
  onStateUpdate: (updates: Partial<TutorialState>) => void;
  onChapterContentUpdate: (chapterId: string, content: string) => void;
  githubToken?: string;
}

const TutorialView: React.FC<TutorialViewProps> = ({ state, onStateUpdate, onChapterContentUpdate, githubToken }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  const currentChapter = state.chapters.find(c => c.id === state.currentChapterId);
  const content = state.currentChapterId ? state.generatedContent[state.currentChapterId] : null;

  useEffect(() => {
    const loadChapterContent = async () => {
      if (!currentChapter) return;
      
      // Strict Cache Check: if content exists for this ID, do absolutely nothing.
      if (state.generatedContent[currentChapter.id]) {
        return;
      }

      setLoadingContent(true);
      try {
        // 1. Fetch relevant files content
        const fileContents = await Promise.all(
          currentChapter.relevantFiles.map(path => 
            fetchFileContent(state.owner, state.repo, path, githubToken)
          )
        );

        // 2. Generate explanation
        const markdown = await generateChapterContent(state.repo, currentChapter, fileContents);

        // 3. Update state using the safe handler
        onChapterContentUpdate(currentChapter.id, markdown);

      } catch (err) {
        console.error(err);
      } finally {
        setLoadingContent(false);
      }
    };

    if (currentChapter) {
        loadChapterContent();
    }
    // We strictly depend on currentChapter.id to trigger loads. 
    // We include state.generatedContent to allow the effect to re-run and "do nothing" if content arrived.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapter?.id, state.generatedContent]);


  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        chapters={state.chapters}
        currentChapterId={state.currentChapterId}
        onSelectChapter={(id) => onStateUpdate({ currentChapterId: id })}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        repoName={state.repo}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar (Mobile only essentially, or for global actions) */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-background/80 backdrop-blur z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
            >
                <IconMenu />
            </button>
            <h2 className="text-lg font-medium text-white truncate">
                {currentChapter ? currentChapter.title : 'Welcome'}
            </h2>
          </div>
        </div>

        {/* Main Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar scroll-smooth">
            <div className="max-w-4xl mx-auto pb-20">
                {!state.currentChapterId ? (
                    // Empty State / Welcome
                    <div className="flex flex-col items-center justify-center h-full text-center mt-20">
                        <div className="w-20 h-20 rounded-2xl bg-surface border border-white/5 flex items-center justify-center mb-6">
                            <IconBook className="w-10 h-10 text-gray-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Ready to Learn</h2>
                        <p className="text-gray-400 max-w-md">
                            Select a chapter from the sidebar to generate a tailored tutorial for that section of the codebase.
                        </p>
                    </div>
                ) : (
                    // Content
                    <>
                        {loadingContent ? (
                            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                <IconLoader className="w-12 h-12 text-primary animate-spin mb-6" />
                                <h3 className="text-xl font-semibold text-white mb-2">Analyzing Codebase...</h3>
                                <p className="text-gray-400 text-center max-w-md">
                                    Gemini is reading the files: <br/>
                                    <span className="text-sm font-mono text-primary/80 mt-2 block">
                                        {currentChapter?.relevantFiles.slice(0, 3).join(', ')}
                                        {currentChapter?.relevantFiles.length! > 3 && '...'}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {content && <MarkdownRenderer content={content} />}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialView;