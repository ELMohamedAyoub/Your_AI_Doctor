import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/patient/sign-in(.*)',
  '/patient/sign-up(.*)',
  '/doctor/sign-in(.*)',
  '/doctor/sign-up(.*)',
  '/sign-in(.*)',  // Legacy support
  '/sign-up(.*)',  // Legacy support
  '/api/tts',
  '/api/set-role',  // Allow role setting
  '/api/get-role'   // Allow role checking
])

// Role-protected routes
const isPatientRoute = createRouteMatcher([
  '/patient-dashboard(.*)',
  '/onboarding(.*)',
  '/api/patient(.*)',
  '/api/clinical(.*)'
])

const isDoctorRoute = createRouteMatcher([
  '/doctor(.*)',
  '/api/doctor(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()
  const url = req.nextUrl.clone()
  
  // Get user role from metadata
  const role = userId ? (
    (sessionClaims?.metadata as any)?.role || 
    (sessionClaims?.unsafeMetadata as any)?.role
  ) : null

  // Redirect authenticated users away from auth pages
  if (userId && isPublicRoute(req) && req.nextUrl.pathname !== '/') {
    if (role === 'patient') {
      url.pathname = '/patient-dashboard'
      return NextResponse.redirect(url)
    } else if (role === 'doctor') {
      url.pathname = '/doctor'
      return NextResponse.redirect(url)
    }
  }

  // Allow public routes for non-authenticated users
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Protect all other routes
  if (!userId) {
    await auth.protect()
    return
  }

  // Role-based routing
  if (isPatientRoute(req)) {
    if (role && role !== 'patient') {
      // User has a role but it's not patient - redirect
      url.pathname = role === 'doctor' ? '/doctor' : '/'
      return NextResponse.redirect(url)
    }
    // If no role yet, allow through (they might have just set it)
  }

  if (isDoctorRoute(req)) {
    if (role && role !== 'doctor') {
      // User has a role but it's not doctor - redirect
      url.pathname = role === 'patient' ? '/patient-dashboard' : '/'
      return NextResponse.redirect(url)
    }
    // If no role yet, allow through (they might have just set it)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}