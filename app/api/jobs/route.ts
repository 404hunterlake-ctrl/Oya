import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const sabiId = searchParams.get('sabiId');
    const status = searchParams.get('status');

    // Non-admins can only see their own jobs
    const where: Record<string, unknown> = {};
    if (user?.role === 'client') {
      where.clientId = user.userId;
    } else if (user?.role === 'sabi') {
      where.sabiId = user.userId;
    } else {
      // Admin or unauthenticated — allow filters
      if (clientId) where.clientId = clientId;
      if (sabiId) where.sabiId = sabiId;
    }
    if (status) where.status = status;

    const jobs = await prisma.job.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true, location: true } },
        sabi: { select: { id: true, name: true, email: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sabiId, title, description, price, date } = body;

    if (!sabiId || !title) {
      return NextResponse.json(
        { error: 'sabiId and title are required' },
        { status: 400 }
      );
    }

    // Verify the sabi exists and has a SabiProfile
    const sabi = await prisma.user.findUnique({
      where: { id: sabiId },
      include: { sabiProfile: true },
    });
    if (!sabi || !sabi.sabiProfile) {
      return NextResponse.json(
        { error: 'Invalid sabiId — the specified Sabi does not exist' },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        clientId: user.userId,
        sabiId,
        title,
        description: description || '',
        price: price || 0,
        date: date ? new Date(date) : null,
        status: 'pending',
      },
      include: {
        client: { select: { id: true, name: true, email: true, location: true } },
        sabi: { select: { id: true, name: true, email: true, location: true } },
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error: unknown) {
    console.error('Create job error:', error);
    // Handle Prisma foreign key constraint errors
    const prismaError = error as { code?: string; meta?: { modelName?: string } };
    if (prismaError.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid sabiId — the specified Sabi does not exist' },
        { status: 400 }
      );
    }
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'A job with these details already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
