import { db } from "@/server/db";
import { Octokit } from "octokit";
import { aiSummariseCommit } from "./gemini";
import axios from "axios";


const octokit = new Octokit({
    auth: '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'
});

type response = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
};

export const getCommitHashes = async (
    githubUrl: string,
): Promise<response[]> => {
    const [owner, repo] = githubUrl.split("/").slice(3, 5);
    if (!owner || !repo) {
        throw new Error("Invalid github url")
    }
    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
    })
  
    //  we need commit author, commit message, commit hash and commit time
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
};

export const pollRepo = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGitHubUrl(projectId);
    const commitHases = await getCommitHashes(project?.githubUrl ?? "");
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHases);
    const summariesResponse = await Promise.allSettled(
        unprocessedCommits.map((hash) => {
            return summariseCommit(githubUrl, hash.commitHash);
        }),
    );
    const summaries = summariesResponse.map((summary) => {
        if (summary.status === "fulfilled") {
            return summary.value as string;
        }
    });
    const commits = await db.commit.createMany({
        data: summaries.map((summary, idx) => ({
            projectId: projectId,
            commitHash: unprocessedCommits[idx]!.commitHash,
            summary: summary!,
            commitAuthorName: unprocessedCommits[idx]!.commitAuthorName,
            commitDate: unprocessedCommits[idx]!.commitDate,
            commitMessage: unprocessedCommits[idx]!.commitMessage,
            commitAuthorAvatar: unprocessedCommits[idx]!.commitAuthorAvatar,
        })),
    });
    return commits;
};

async function fetchProjectGitHubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId
        }, select: {
            githubUrl: true
        }
    });
    const githubUrl = project?.githubUrl ?? "";
    return { project, githubUrl };
}

async function summariseCommit(githubUrl: string, commitHash: string) {
    const { data } = await axios.get(
        `${githubUrl}/commit/${commitHash}.diff`,
        {
            headers: {
                Accept: "application/vnd.github.v3.diff",
            },
        }
    );
    return await aiSummariseCommit (data) || ""
}

async function filterUnprocessedCommits(projectId: string, commitHases: response[]) {
    const processedCommits = await db.commit.findMany({
        where: {
            projectId: projectId,
        },
    });
    const unprocessedCommits = commitHases.filter(
        (hash) => !processedCommits.some((commit) => commit.commitHash === hash.commitHash)
    );
    return unprocessedCommits;
}
