import { db } from '@/server/db'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import SyncUserClient from './sync-user-client'

export default async function SyncUser() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return <SyncUserClient />
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses.find(
      e => e.id === user.primaryEmailAddressId
    )?.emailAddress
    
    if (!email) {
      return notFound()
    }

    await db.user.upsert({
      where: { id: userId },
      update: {
        emailAddress: email,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName
      },
      create: {
        id: userId,
        emailAddress: email,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })

    // ✅ Don’t catch NEXT_REDIRECT — let Next.js handle it
    return redirect('/dashboard')

  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error // let Next.js handle redirect
    }
    console.error('User sync failed:', error)
    return <SyncUserClient />
  }
}
