import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const questionRouter = createTRPCRouter({
    saveAnswer: protectedProcedure
        .input(z.object({ projectId: z.string(), question: z.string().min(1), answer: z.string().min(1), filesReferenced: z.array(z.object({ fileName: z.string().min(1), sourceCode: z.string().min(1) })).optional() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.question.create({
                data: {
                    question: input.question,
                    answer: input.answer,
                    projectId: input.projectId,
                    userId: ctx.user.userId!,
                    filesReferenced: input.filesReferenced
                }
            })
        }),
    getAllQuestions: protectedProcedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.question.findMany({ where: { projectId: input.projectId }, include: { user: true }, orderBy: { createdAt: 'desc' } })
        })
});