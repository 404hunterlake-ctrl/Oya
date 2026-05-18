import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: { sabiProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      location: u.location,
      avatar: u.avatar,
      createdAt: u.createdAt,
      sabiProfile: u.sabiProfile
        ? {
            userId: u.sabiProfile.userId,
            skills: u.sabiProfile.skills.split(',').filter(Boolean),
            rating: u.sabiProfile.rating,
            verified: u.sabiProfile.verified,
            hourlyRate: u.sabiProfile.hourlyRate,
            bio: u.sabiProfile.bio,
            completedJobs: u.sabiProfile.completedJobs,
          }
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
