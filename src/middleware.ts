import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const publicRoutes = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/stripe(.*)',
  '/sync-user', // Keep public to allow initial access
])

export default clerkMiddleware(async(auth, request) => {
  // Redirect root path appropriately
  if (request.nextUrl.pathname === '/') {
     const { userId } =  await auth()
    if (userId) {
      // Use NextResponse instead of Response
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }


  // Skip auth for public routes
  if (publicRoutes(request)) {
    return NextResponse.next()
  }

  // Protect all other routes
  auth.protect({
    unauthenticatedUrl: '/sign-in', 
  })
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}