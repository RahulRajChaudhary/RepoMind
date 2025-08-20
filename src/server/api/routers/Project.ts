import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";


export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure.input(z.object({
    githubUrl: z.string(),
    name: z.string(),
    githubToken: z.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const project = await ctx.db.project.create({
      data: {
        githubUrl: input.githubUrl,
        name: input.name,
        userToProjects: {
          create: {
            user: {
              connect: {
                id: ctx.user.userId ?? undefined,
              },
            },
          },
        },
      },
    });
    return project
  })
})