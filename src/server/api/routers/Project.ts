import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { pollRepo } from "@/lib/github";
import { checkCredits, indexGithubRepo, loadGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
  getMyCredits: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({ where: { id: ctx.user.userId! } })
    return user?.credits || 0
  }),

  checkCredits: protectedProcedure.input(z.object({ githubUrl: z.string().min(1), githubToken: z.string().optional() })).
    mutation(async ({ ctx, input }) => {
      const fileCount = await checkCredits(input.githubUrl, input.githubToken)
      const user = await ctx.db.user.findUnique({ where: { id: ctx.user.userId! } })
      return {
        credits: user?.credits || 0,
        fileCount,
      }
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), githubUrl: z.string().min(1), githubToken: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {

      const user = await ctx.db.user.findUnique({ where: { id: ctx.user.userId! } })
      if (!user) throw new Error("User not found")
      const currentCredits = user.credits || 0
      const fileCount = await checkCredits(input.githubUrl, input.githubToken)
      if (currentCredits < fileCount) throw new Error("Not enough credits")

      const project = await ctx.db.$transaction(async (tx) => {
        const createdProject = await tx.project.create({
          data: {
            name: input.name,
            githubUrl: input.githubUrl,
          },
        });

        await tx.userToProject.create({
          data: {
            userId: ctx.user.userId!,
            projectId: createdProject.id,
          },
        });

        return createdProject;
      });
      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pollRepo(project.id)
      await ctx.db.user.update({ where: { id: ctx.user.userId! }, data: { credits: { decrement: fileCount } } })
      return project;
    }),
  archiveProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.project.update({ where: { id: input.projectId }, data: { deletedAt: new Date() } });
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: { some: { userId: ctx.user.userId! } },
        deletedAt: null,
      },
    });
  }),
  getCommits: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
    pollRepo(input.projectId).then((commits) => {
      console.log(`polled ${commits.count} commits`)
    }).catch(console.error)
    return await ctx.db.commit.findMany({
      where: { projectId: input.projectId },
    });
  }),
  getAllMeetings: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.db.meeting.findMany({
      where: { projectId: input.projectId },
      include: {
        issues: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }),
  uploadMeeting: protectedProcedure.input(z.object({ projectId: z.string(), audio_url: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
    const meeting = await ctx.db.meeting.create({
      data: {
        projectId: input.projectId,
        url: input.audio_url,
        name: input.name,
        createdById: ctx.user.userId!,
      },
    });
    return meeting;
  }),
  deleteMeeting: protectedProcedure.input(z.object({ meetingId: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.meeting.delete({ where: { id: input.meetingId } });
  }),
  getMembers: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.db.userToProject.findMany({ where: { projectId: input.projectId }, include: { user: true } });
  }),
  getStripeTransactions: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.stripeTransaction.findMany({ where: { userId: ctx.user.userId! } });
  }),
});