import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";


export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure.input(z.object({
    githubUrl: z.string(),
    name: z.string(),
    githubToken: z.string()
  })).mutation(async ({ ctx, input }) => {
    console.log(input +"input and ctx" + ctx )
    const project = await ctx.db.project.create({
      data: {
       githubUrl: input.githubUrl,
        name: input.name,
        userToProjects: {
          create: {
            userId: ctx.user.userId!
          }
        }
    }
    })
    return project
  })
})