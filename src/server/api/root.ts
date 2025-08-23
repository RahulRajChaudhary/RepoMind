import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { projectRouter } from "./routers/Project";
import { questionRouter } from "./routers/question";
import { meetingRouter } from "./routers/meeting";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: projectRouter,
  question: questionRouter,
  meeting: meetingRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
