'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function SyncUserClient() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn) {
      // Attempt to trigger server-side sync by refreshing
      router.refresh()
    } else {
      // Redirect to sign-in if not authenticated
      router.replace('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  // Auto-retry every 2 seconds (max 5 times)
  useEffect(() => {
    if (retryCount < 5) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        router.refresh()
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [retryCount, router])

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="text-center">
        <p className="text-lg mb-4">Completing your account setup...</p>
        <div className="w-12 h-12 border-t-4 border-primary rounded-full animate-spin mx-auto"></div>
      </div>
      
      {retryCount > 2 && (
        <div className="mt-4 text-center">
          <p className="text-muted-foreground mb-2">
            Taking longer than expected
          </p>
          <button 
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Retry Now
          </button>
        </div>
      )}
    </div>
  )
}