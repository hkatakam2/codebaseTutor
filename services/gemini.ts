import { GoogleGenAI, Type } from "@google/genai";
import { Chapter, FileContent } from '../types';

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing");
    return new GoogleGenAI({ apiKey });
};

// Phase 1: Analyze structure and generate chapters
export const generateTutorialOutline = async (
    repoName: string,
    fileTree: string[],
    readmeContent: string
): Promise<Chapter[]> => {
    const ai = getAiClient();
    
    // Truncate tree if too long to fit in context efficiently, prioritizing top level
    const truncatedTree = fileTree.length > 2000 ? fileTree.slice(0, 2000).join('\n') + "\n...(truncated)" : fileTree.join('\n');
    const truncatedReadme = readmeContent.length > 10000 ? readmeContent.substring(0, 10000) : readmeContent;

    const prompt = `
You are a senior software architect creating a comprehensive onboarding tutorial for a new developer joining the "${repoName}" project.

Based on the file structure and the README below, create a structured "Table of Contents" for a tutorial series that gradually explains the codebase.
The chapters should be logical: starting from "Overview & Setup", moving to "Core Architecture", "Key Features", and finally "Advanced/Utility".

For each chapter, list the *specific file paths* from the provided tree that are most relevant to read/analyze for that chapter.

File Tree:
${truncatedTree}

README:
${truncatedReadme}
`;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                relevantFiles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ['id', 'title', 'description', 'relevantFiles']
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                systemInstruction: "You are an expert technical writer and code educator."
            }
        });

        const json = JSON.parse(response.text || "[]");
        return json;
    } catch (error) {
        console.error("Gemini Outline Error:", error);
        throw new Error("Failed to generate tutorial outline.");
    }
};

// Phase 2: Generate content for a specific chapter
export const generateChapterContent = async (
    repoName: string,
    chapter: Chapter,
    files: FileContent[]
): Promise<string> => {
    const ai = getAiClient();

    // Prepare context from files
    let codebaseContext = "";
    files.forEach(f => {
        // Truncate very large files to avoid blowing token limits excessively
        const content = f.content.length > 20000 ? f.content.substring(0, 20000) + "\n...[truncated]" : f.content;
        codebaseContext += `\n--- File: ${f.path} ---\n${content}\n`;
    });

    const prompt = `
Context: You are writing Chapter "${chapter.title}" for the "${repoName}" codebase tutorial.
Chapter Description: ${chapter.description}

Here are the relevant source code files for this chapter:
${codebaseContext}

Task: Write a detailed, educational Markdown tutorial for this chapter.

Guidelines:
1. **Structure**: Use H2 (##) for main sections.
2. **Explanation**: Explain the *purpose* of the code, how the components interact, and the data flow.
3. **Code**: Use code blocks (with language specified, e.g. \`typescript\`) to show snippets. Do NOT just dump the whole code.
4. **Visuals**: You MUST use **Mermaid diagrams** to visualize relationships, data flows, or class structures where complex interactions exist. 
   - Use \`mermaid\` code blocks.
   - Example:
     \`\`\`mermaid
     graph TD;
       A[Client] -->|Request| B(Server);
     \`\`\`
   - Create diagrams for: Call hierarchies, Data models, State machines, or Component architecture.
5. **Tone**: Be concise, professional, and insightful.

If a file is missing or truncated, infer its role from context.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Using Pro for better code reasoning
            contents: prompt,
            config: {
                systemInstruction: "You are a world-class developer advocate writing high-quality documentation. You specialize in creating clear visual diagrams using Mermaid.js."
            }
        });

        return response.text || "Failed to generate content.";
    } catch (error) {
        console.error("Gemini Content Error:", error);
        return "## Error\n\nFailed to generate this chapter. Please try again.";
    }
};