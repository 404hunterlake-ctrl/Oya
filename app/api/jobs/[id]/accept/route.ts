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

    if (user.role !== 'sabi') {
      return NextResponse.json(
        { error: 'Only sabis can accept jobs' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'pending') {
      return NextResponse.json(
        { error: 'Job is not in pending status' },
        { status: 400 }
      );
    }

    if (job.sabiId !== user.userId) {
      return NextResponse.json(
        { error: 'This job was not assigned to you' },
        { status: 403 }
      );
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { status: 'accepted' },
      include: {
        client: { select: { id: true, name: true, email: true, location: true } },
        sabi: { select: { id: true, name: true, email: true, location: true } },
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Accept job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
