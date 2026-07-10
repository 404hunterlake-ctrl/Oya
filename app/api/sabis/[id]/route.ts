import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id, role: 'sabi' },
      include: { sabiProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Sabi not found' }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Get sabi error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
