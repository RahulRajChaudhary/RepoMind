"use client"

import { useUser } from '@clerk/nextjs'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const DashboardPage = () => {
  const { isLoaded, user, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-12 w-12" />
        <span className="ml-4 text-lg">Loading user data...</span>
      </div>
    )
  }

  if (!isSignedIn) {
    return null; // Redirecting via useEffect
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        {user ? `Welcome, ${user.firstName}!` : 'No user data'}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <pre>{user.fullName || 'No user data'}</pre>
      </div>
    </div>
  )
}

export default DashboardPage