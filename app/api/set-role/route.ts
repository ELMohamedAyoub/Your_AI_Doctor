import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()
    
    if (!role || !['patient', 'doctor'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Get user info from Clerk
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const userName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.emailAddresses[0]?.emailAddress || 'Unknown User'

    // Update user metadata with role
    await client.users.updateUserMetadata(userId, {
      unsafeMetadata: {
        role: role
      }
    })

    // Create Patient or Doctor record in database
    if (role === 'patient') {
      // Check if patient already exists
      const existingPatient = await prisma.patient.findUnique({
        where: { clerkUserId: userId }
      })

      if (!existingPatient) {
        // Will be completed during onboarding
        await prisma.patient.create({
          data: {
            clerkUserId: userId,
            name: userName,
            surgery: 'Pending',  // Will be set in onboarding
            surgeryDate: new Date()  // Will be set in onboarding
          }
        })
      }
    } else if (role === 'doctor') {
      // Check if doctor already exists
      const existingDoctor = await prisma.doctor.findUnique({
        where: { clerkUserId: userId }
      })

      if (!existingDoctor) {
        await prisma.doctor.create({
          data: {
            clerkUserId: userId,
            name: userName
          }
        })
      }
    }

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Error setting role:', error)
    return NextResponse.json({ error: 'Failed to set role' }, { status: 500 })
  }
}
