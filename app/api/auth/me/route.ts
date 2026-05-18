import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userPayload = await getUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      include: { sabiProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      avatar: user.avatar,
      sabiProfile: user.sabiProfile
        ? {
            userId: user.sabiProfile.userId,
            skills: user.sabiProfile.skills.split(',').filter(Boolean),
            rating: user.sabiProfile.rating,
            verified: user.sabiProfile.verified,
            hourlyRate: user.sabiProfile.hourlyRate,
            bio: user.sabiProfile.bio,
            completedJobs: user.sabiProfile.completedJobs,
          }
        : null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
