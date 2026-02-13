import React, { useState } from 'react';
import { IconGithub, IconBook, IconLoader } from './Icons';
import { parseRepoUrl } from '../services/github';

interface RepoInputProps {
  onAnalyze: (url: string, token: string) => void;
  loading: boolean;
  error: string | null;
}

const RepoInput: React.FC<RepoInputProps> = ({ onAnalyze, loading, error }) => {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onAnalyze(url, token);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-lg bg-surface/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-lg shadow-primary/20">
            <IconBook className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Codebase Tutor
          </h1>
          <p className="text-secondary">
            Turn any GitHub repository into an interactive, chapter-based learning experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
              Repository URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <IconGithub className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="w-full pl-10 pr-4 py-3 bg-background border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-white placeholder-gray-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
              GitHub Token <span className="text-xs text-gray-600">(Optional, for higher rate limits)</span>
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-white placeholder-gray-600"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-300 ${
              loading || !url
                ? 'bg-gray-700 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <>
                <IconLoader className="w-5 h-5 animate-spin" />
                <span>Analyzing Repository...</span>
              </>
            ) : (
              <span>Start Learning</span>
            )}
          </button>
        </form>
        
        <div className="mt-6 flex justify-center space-x-4">
            <button onClick={() => setUrl("https://github.com/facebook/react")} className="text-xs text-gray-500 hover:text-primary transition-colors">Try React</button>
            <button onClick={() => setUrl("https://github.com/remix-run/react-router")} className="text-xs text-gray-500 hover:text-primary transition-colors">Try React Router</button>
            <button onClick={() => setUrl("https://github.com/axios/axios")} className="text-xs text-gray-500 hover:text-primary transition-colors">Try Axios</button>
        </div>
      </div>
    </div>
  );
};

export default RepoInput;
