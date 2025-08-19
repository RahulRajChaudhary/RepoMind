import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    return redirect("/dashboard");
  } else {
    // Redirect to sign-in for unauthenticated users
    return redirect("/sign-in");
  }
}