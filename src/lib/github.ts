import { db } from "@/server/db";
import axios from "axios";
import { Octokit } from "octokit";
import { aiSummariseCommit } from "./gemini";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

type CommitResponse = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
};

export const getCommitHashes = async (
    githubUrl: string,
): Promise<CommitResponse[]> => {
    try {
        // Add validation for empty URL
        if (!githubUrl || githubUrl.trim() === '') {
            console.error("Empty GitHub URL provided");
            return [];
        }

        const [owner, repo] = githubUrl.split("/").slice(3, 5);
        if (!owner || !repo) {
            throw new Error("Invalid github url");
        }

        const { data } = await octokit.rest.repos.listCommits({
            owner,
            repo,
        });

        // need commit author, commit message, commit hash and commit time
        const sortedCommits = data.sort(
            (a: any, b: any) =>
                new Date(b.commit.author.date).getTime() -
                new Date(a.commit.author.date).getTime(),
        ) as any[];

        return sortedCommits.slice(0, 15).map((commit: any) => ({
            commitHash: commit.sha as string,
            commitMessage: commit.commit.message ?? "",
            commitAuthorName: commit.commit?.author?.name ?? "",
            commitAuthorAvatar: commit.author?.avatar_url ?? "",
            commitDate: commit.commit?.author?.date ?? "",
        }));
    } catch (error) {
        console.error("Error fetching commits:", error);
        return [];
    }
};

export const pollRepo = async (projectId: string) => {
    try {
        const { project, githubUrl } = await fetchProjectGitHubUrl(projectId);
        const commitHashes = await getCommitHashes(project?.githubUrl ?? "");
        const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

        const summariesResponse = await Promise.allSettled(
            unprocessedCommits.map((hash) => {
                return summariseCommit(githubUrl, hash.commitHash);
            }),
        );

        // Filter out failed summaries and map to valid data
        const validCommitsData = summariesResponse
            .map((summaryResult, index) => {
                if (summaryResult.status === "fulfilled" && summaryResult.value) {
                    const unprocessedCommit = unprocessedCommits[index];
                    if (unprocessedCommit) {
                        return {
                            projectId: projectId,
                            commitHash: unprocessedCommit.commitHash,
                            summary: summaryResult.value,
                            commitAuthorName: unprocessedCommit.commitAuthorName,
                            commitDate: unprocessedCommit.commitDate,
                            commitMessage: unprocessedCommit.commitMessage,
                            commitAuthorAvatar: unprocessedCommit.commitAuthorAvatar,
                        };
                    } else {
                        return null;
                    }
                }
                return null;
            })
            .filter(Boolean) as any[];

        // Only create commits if we have valid data
        if (validCommitsData.length > 0) {
            const commits = await db.commit.createMany({
                data: validCommitsData,
            });
            return commits;
        }

        return { count: 0 }; // Return empty result if no valid commits
    } catch (error) {
        console.error("Error in pollRepo:", error);
        return { count: 0 };
    }
};

async function fetchProjectGitHubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            githubUrl: true
        }
    });
    const githubUrl = project?.githubUrl ?? "";
    return { project, githubUrl };
}

async function summariseCommit(githubUrl: string, commitHash: string) {
    try {
        const { data } = await axios.get(
            `${githubUrl}/commit/${commitHash}.diff`,
            {
                headers: {
                    Accept: "application/vnd.github.v3.diff",
                },
            }
        );
        return await aiSummariseCommit(data) || "Summary unavailable";
    } catch (error) {
        console.error(`Error summarizing commit ${commitHash}:`, error);
        return "Summary unavailable";
    }
}

async function filterUnprocessedCommits(projectId: string, commitHashes: CommitResponse[]) {
    const processedCommits = await db.commit.findMany({
        where: {
            projectId: projectId,
        },
    });
    const unprocessedCommits = commitHashes.filter(
        (hash) => !processedCommits.some((commit) => commit.commitHash === hash.commitHash)
    );
    return unprocessedCommits;
}