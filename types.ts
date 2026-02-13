export interface GitHubNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface FileContent {
  path: string;
  content: string; // Decoded string
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  relevantFiles: string[]; // List of file paths relevant to this chapter
}

export interface TutorialState {
  repoUrl: string;
  owner: string;
  repo: string;
  tree: GitHubNode[];
  chapters: Chapter[];
  currentChapterId: string | null;
  generatedContent: Record<string, string>; // Map chapterId -> Markdown content
  loading: boolean;
  loadingStep: string;
  error: string | null;
}

export enum ViewState {
  LANDING,
  ANALYZING,
  TUTORIAL
}
