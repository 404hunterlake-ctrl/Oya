import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { CreateReviewSchema } from '@/lib/validation';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, rating, comment } = CreateReviewSchema.parse(body);

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { reviews: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed jobs' },
        { status: 400 }
      );
    }

    // Only the client who created the job can review
    if (user.userId !== job.clientId) {
      return NextResponse.json(
        { error: 'Only the client can review this job' },
        { status: 403 }
      );
    }

    // Check if already reviewed
    const existingReview = job.reviews.find((r) => r.reviewerId === user.userId);
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this job' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        jobId,
        reviewerId: user.userId,
        rating,
        comment: comment || '',
      },
    });

    // Update sabi's average rating
    if (job.sabiId) {
      const allReviews = await prisma.review.findMany({
        where: { job: { sabiId: job.sabiId } },
      });
      const avgRating =
        allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0;

      await prisma.sabiProfile.updateMany({
        where: { userId: job.sabiId },
        data: { rating: Math.round(avgRating * 10) / 10 },
      });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
