"use client"

import { useUser } from '@clerk/nextjs'
import { Loader } from 'lucide-react'
import { useEffect } from 'react'

const DashboardPage = () => {
  const { isLoaded, user, isSignedIn } =  useUser()

  useEffect(() => {
    console.log('Dashboard user state:', { isLoaded, user, isSignedIn })
  }, [isLoaded, user, isSignedIn])

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-12 w-12" />
        <span className="ml-4 text-lg">Loading user data...</span>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Not Signed In</h1>
        <p>You need to be signed in to view this page</p>
      </div>
    )
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