import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const skill = searchParams.get('skill') || '';
    const location = searchParams.get('location') || '';

    const sabis = await prisma.user.findMany({
      where: {
        role: 'sabi',
        ...(search && {
          OR: [
            { name: { contains: search } },
            { sabiProfile: { skills: { contains: search } } },
          ],
        }),
        ...(skill && { sabiProfile: { skills: { contains: skill } } }),
        ...(location && { location: { contains: location } }),
      },
      include: { sabiProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    const result = sabis.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      avatar: user.avatar,
      profile: user.sabiProfile
        ? {
            userId: user.sabiProfile.userId,
            skills: (user.sabiProfile.skills || '').split(',').filter(Boolean),
            rating: user.sabiProfile.rating,
            verified: user.sabiProfile.verified,
            hourlyRate: user.sabiProfile.hourlyRate,
            bio: user.sabiProfile.bio,
            completedJobs: user.sabiProfile.completedJobs,
          }
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get sabis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
