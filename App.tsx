import React, { useState } from 'react';
import { TutorialState, ViewState } from './types';
import RepoInput from './components/RepoInput';
import TutorialView from './components/TutorialView';
import { parseRepoUrl, fetchRepoTree, fetchFileContent, filterImportantFiles } from './services/github';
import { generateTutorialOutline } from './services/gemini';

const INITIAL_STATE: TutorialState = {
  repoUrl: '',
  owner: '',
  repo: '',
  tree: [],
  chapters: [],
  currentChapterId: null,
  generatedContent: {},
  loading: false,
  loadingStep: '',
  error: null,
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [state, setState] = useState<TutorialState>(INITIAL_STATE);
  const [token, setToken] = useState<string>('');

  const handleAnalyze = async (url: string, githubToken: string) => {
    const repoInfo = parseRepoUrl(url);
    if (!repoInfo) {
      setState(s => ({ ...s, error: 'Invalid GitHub URL' }));
      return;
    }

    setToken(githubToken);
    // Switch to analyzing state to show loading UI in RepoInput
    setView(ViewState.ANALYZING);
    setState({ ...INITIAL_STATE, repoUrl: url, owner: repoInfo.owner, repo: repoInfo.repo, loading: true });
    
    try {
      // 1. Fetch File Tree
      setState(s => ({ ...s, loadingStep: 'Fetching repository structure...' }));
      const fullTree = await fetchRepoTree(repoInfo.owner, repoInfo.repo, githubToken);
      const importantFiles = filterImportantFiles(fullTree);
      
      // 2. Fetch README
      setState(s => ({ ...s, loadingStep: 'Reading documentation...' }));
      const readmeNode = fullTree.find(f => f.path.toLowerCase() === 'readme.md');
      let readmeContent = '';
      if (readmeNode) {
        const res = await fetchFileContent(repoInfo.owner, repoInfo.repo, readmeNode.path, githubToken);
        readmeContent = res.content;
      }

      // 3. Generate Outline via Gemini
      setState(s => ({ ...s, loadingStep: 'Generating study plan with AI...' }));
      const filePaths = importantFiles.map(f => f.path);
      const chapters = await generateTutorialOutline(repoInfo.repo, filePaths, readmeContent);

      // 4. Update State and Transition
      setState(s => ({ 
        ...s, 
        tree: fullTree, 
        chapters: chapters.map((c, i) => ({ ...c, id: `chap-${i}` })),
        loading: false,
        error: null
      }));
      setView(ViewState.TUTORIAL);

    } catch (err: any) {
      setState(s => ({ ...s, loading: false, error: err.message || 'An error occurred' }));
      setView(ViewState.LANDING);
    }
  };

  const updateTutorialState = (updates: Partial<TutorialState>) => {
    setState(s => ({ ...s, ...updates }));
  };

  const handleChapterContentUpdate = (chapterId: string, content: string) => {
    setState(s => ({
      ...s,
      generatedContent: {
        ...s.generatedContent,
        [chapterId]: content
      }
    }));
  };

  if (view === ViewState.LANDING || view === ViewState.ANALYZING) {
    return <RepoInput onAnalyze={handleAnalyze} loading={state.loading} error={state.error} />;
  }

  return (
    <TutorialView 
      state={state} 
      onStateUpdate={updateTutorialState} 
      onChapterContentUpdate={handleChapterContentUpdate}
      githubToken={token}
    />
  );
};

export default App;