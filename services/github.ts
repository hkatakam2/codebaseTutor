import { GitHubNode, FileContent } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

// Helper to handle rate limits and errors
async function fetchWithAuth(url: string, token?: string) {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Please try again later or provide a token.");
    }
    if (response.status === 404) {
      throw new Error("Repository not found. Please check the URL.");
    }
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }

  return response.json();
}

export const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch (e) {
    // console.error("Invalid URL", e);
  }
  return null;
};

export const fetchRepoTree = async (owner: string, repo: string, token?: string): Promise<GitHubNode[]> => {
  // Get default branch first (usually main or master)
  const repoData = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, token);
  const defaultBranch = repoData.default_branch;

  // Fetch recursive tree
  const treeData = await fetchWithAuth(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    token
  );

  return treeData.tree;
};

export const fetchFileContent = async (owner: string, repo: string, path: string, token?: string): Promise<FileContent> => {
  try {
    const data = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, token);
    
    // GitHub API returns content in base64
    if (data.content && data.encoding === 'base64') {
        // Handle unicode properly
        const decoded = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
        return { path, content: decoded };
    } else if (data.download_url) {
        // Fallback for large files usually provided as download_url raw text
        const rawRes = await fetch(data.download_url);
        const text = await rawRes.text();
        return { path, content: text };
    }
    
    throw new Error("Could not decode content");
  } catch (error) {
    console.warn(`Failed to fetch content for ${path}:`, error);
    return { path, content: `// Error fetching content for ${path}` };
  }
};

export const filterImportantFiles = (tree: GitHubNode[]): GitHubNode[] => {
  const IMPORTANT_EXTENSIONS = ['.md', '.json', '.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.css', '.html', '.yml', '.yaml'];
  const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage', '__tests__', 'test', 'vendor'];
  
  return tree.filter(node => {
    if (node.type !== 'blob') return false;
    
    // Filter out ignored directories
    if (IGNORED_DIRS.some(dir => node.path.includes(`/${dir}/`) || node.path.startsWith(`${dir}/`))) {
      return false;
    }

    // Keep README and package.json priority high
    if (node.path.toLowerCase().includes('readme.md') || node.path.endsWith('package.json')) {
      return true;
    }
    
    // Check extensions
    return IMPORTANT_EXTENSIONS.some(ext => node.path.endsWith(ext));
  });
};