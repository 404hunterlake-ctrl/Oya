import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Ensure the user exists and is a sabi
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { sabiProfile: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role !== 'sabi') {
      return NextResponse.json(
        { error: 'User is not a sabi' },
        { status: 400 }
      );
    }

    if (!targetUser.sabiProfile) {
      return NextResponse.json(
        { error: 'Sabi profile not found' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const verified = body.verified !== undefined ? body.verified : true;

    const updatedProfile = await prisma.sabiProfile.update({
      where: { userId: id },
      data: { verified },
    });

    return NextResponse.json({
      userId: updatedProfile.userId,
      verified: updatedProfile.verified,
    });
  } catch (error) {
    console.error('Verify sabi error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
