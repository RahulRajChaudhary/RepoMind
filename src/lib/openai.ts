import { OpenAI } from 'openai'
import { loadGithubRepo } from './github-loader'

export const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const getSummary = async (doc: Awaited<ReturnType<typeof loadGithubRepo>>[number]) => {
    console.log("getting summary for", doc.metadata.source);
    const code = doc.pageContent.slice(0, 10000); // Limit to 10000 characters

    const response = await openAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects",
            },
            {
                role: "user",
                content: `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
Here is the code:
---
${code}
---
Give a summary no more than 100 words of the code above`,
            },
        ],
    });

    console.log("got back summary", doc.metadata.source);
    return response.choices[0]?.message.content;
}

export const aiSummariseCommit = async (diff: string) => {
    const response = await openAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an expert programmer, and you are trying to summarize a git diff.
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
It is given only as an example of appropriate comments.`,
            },
            {
                role: "user",
                content: `Please summarise the following diff file: \n\n${diff}`,
            },
        ],
    });

    return response.choices[0]?.message.content;
};


export const getEmbeddings = async (text: string) => {
    const payload = text.replaceAll("\n", " ");
    const response = await openAI.embeddings.create({
        model: "text-embedding-3-large",
        input: payload,
    });
    return response.data[0]?.embedding;
}