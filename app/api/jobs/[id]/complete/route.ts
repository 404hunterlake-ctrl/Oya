import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Job must be accepted before it can be completed' },
        { status: 400 }
      );
    }

    // Only the sabi assigned or the client can complete
    if (
      user.role !== 'admin' &&
      user.userId !== job.sabiId &&
      user.userId !== job.clientId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { status: 'completed' },
      include: {
        client: { select: { id: true, name: true, email: true, location: true } },
        sabi: { select: { id: true, name: true, email: true, location: true } },
      },
    });

    // Increment completedJobs for the sabi
    if (updatedJob.sabiId) {
      await prisma.sabiProfile.updateMany({
        where: { userId: updatedJob.sabiId },
        data: { completedJobs: { increment: 1 } },
      });
    }

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Complete job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
