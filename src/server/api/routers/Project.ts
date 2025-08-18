import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";


export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure.input(z.object({
    githubUrl: z.string(),
    name: z.string(),
    githubToken: z.string()
  })).mutation(({ ctx, input }) => {
    return true
  })
})