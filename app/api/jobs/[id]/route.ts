import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true, location: true, phone: true } },
        sabi: { select: { id: true, name: true, email: true, location: true, phone: true } },
        reviews: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Only the client or sabi on the job (or admin) can update status
    if (
      user.role !== 'admin' &&
      user.userId !== job.clientId &&
      user.userId !== job.sabiId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { status },
      include: {
        client: { select: { id: true, name: true, email: true, location: true } },
        sabi: { select: { id: true, name: true, email: true, location: true } },
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
