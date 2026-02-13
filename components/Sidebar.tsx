import React, { useState } from 'react';
import { Chapter, GitHubNode } from '../types';
import { IconBook, IconFile, IconFolder, IconChevronRight, IconChevronDown, IconCheckCircle, IconX } from './Icons';

interface SidebarProps {
  chapters: Chapter[];
  currentChapterId: string | null;
  onSelectChapter: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  chapters, 
  currentChapterId, 
  onSelectChapter,
  isOpen,
  onClose,
  repoName
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 bg-surface border-r border-white/5 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-surface/50">
          <div className="flex items-center space-x-2 truncate">
            <IconBook className="w-5 h-5 text-primary shrink-0" />
            <span className="font-semibold text-white truncate">{repoName}</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-4">
                Tutorial Plan
            </h3>
            
            <div className="space-y-1">
                {chapters.map((chapter, index) => {
                    const isActive = currentChapterId === chapter.id;
                    return (
                        <button
                            key={chapter.id}
                            onClick={() => {
                                onSelectChapter(chapter.id);
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={`
                                w-full text-left p-3 rounded-lg transition-all duration-200 group relative
                                border border-transparent
                                ${isActive 
                                    ? 'bg-primary/10 border-primary/20 text-white shadow-lg shadow-primary/5' 
                                    : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                                }
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`
                                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono mt-0.5 shrink-0
                                    ${isActive ? 'bg-primary text-white' : 'bg-white/10 text-gray-500 group-hover:bg-white/20'}
                                `}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="font-medium text-sm leading-tight mb-1">
                                        {chapter.title}
                                    </div>
                                    <div className="text-xs opacity-60 line-clamp-2 font-light">
                                        {chapter.description}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 text-center">
            <div className="text-xs text-gray-600">
                Powered by Gemini 3 Pro
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
