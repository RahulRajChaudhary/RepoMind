// Import the GoogleGenerativeAI library
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadGithubRepo } from './github-loader';

// Initialize the Gemini API client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const getSummary = async (doc: Awaited<ReturnType<typeof loadGithubRepo>>[number]) => {
    console.log("getting summary for", doc.metadata.source);
    const code = doc.pageContent.slice(0, 10000); // Limit to 10000 characters

    // Use the Gemini model for content generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Combine the system and user prompts for the Gemini API call
    const prompt = `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects.
You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
Here is the code:
---
${code}
---
Give a summary no more than 100 words of the code above`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("got back summary", doc.metadata.source);
    return text;
}

export const aiSummariseCommit = async (diff: string) => {
    // Use the Gemini model for content generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Combine the system and user prompts for the Gemini API call
    const prompt = `You are an expert programmer, and you are trying to summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`
This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.
[...]
EXAMPLE SUMMARY COMMENTS:
\`\`\`
* Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
* Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
* Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
* Added an OpenAI API for completions [packages/utils/apis/openai.ts]
* Lowered numeric tolerance for test files
\`\`\`
Most commits will have less comments than this examples list.
The last comment does not include the file names,
because there were more than two relevant files in the hypothetical commit.
Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.
Please summarise the following diff file: \n\n${diff}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
};


export const getEmbeddings = async (text: string) => {
    const payload = text.replaceAll("\n", " ");
    
    // Use the Gemini embedding model
    const model = genAI.getGenerativeModel({ model: "embedding-001"});
    
    const result = await model.embedContent(payload);
    return result.embedding.values;
}