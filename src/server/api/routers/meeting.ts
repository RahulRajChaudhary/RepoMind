import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const meetingRouter = createTRPCRouter({
    getMeetingDetails: protectedProcedure.input(z.object({ meetingId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findUnique({
            where: { id: input.meetingId }, include: {
                issues: true
            }
        });
    }),
    askIssue: protectedProcedure.input(z.object({ issueId: z.string(), query: z.string() })).mutation(async ({ ctx, input }) => {
        // return await ctx.db.issue.findUnique({ where: { id: input.issueId } });
        return { answer: "Hello" }
    }),
});