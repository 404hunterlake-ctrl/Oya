/**
 * POST /api/payments/initialize
 * Initialize a payment for a job booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helpers';
import { supabase } from '@/lib/supabase';
import { paystackService } from '@/services/paystack';
import { validatePaymentAmount, nairaToKobo } from '@/lib/payment';
import { PaymentInitSchema } from '@/lib/validation';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    if (config.rateLimitEnabled) {
      const userId = req.headers.get('x-user-id');
      if (userId && !rateLimit(`payment:${userId}`, 10)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }

    // Get authenticated user
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate input
    const body = await req.json();
    const { jobId, amount } = PaymentInitSchema.parse(body);

    // Validate amount
    const amountValidation = validatePaymentAmount(amount);
    if (!amountValidation.valid) {
      return NextResponse.json(
        { error: amountValidation.error },
        { status: 400 }
      );
    }

    // Get job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify user is the client
    if (job.client_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the job creator can pay for this job' },
        { status: 403 }
      );
    }

    // Check if payment already exists
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (existingPayment?.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed for this job' },
        { status: 400 }
      );
    }

    // Cancel any pending payments
    if (existingPayment?.status === 'pending') {
      await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('id', existingPayment.id);
    }

    // Initialize payment with Paystack
    const initResult = await paystackService.initializePayment({
      email: user.email,
      amount,
      jobId,
      userId: user.id,
    });

    if (initResult.status === 'error') {
      return NextResponse.json(
        { error: initResult.message },
        { status: 500 }
      );
    }

    // Create payment record
    const amountInKobo = nairaToKobo(amount);
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          job_id: jobId,
          user_id: user.id,
          amount: amountInKobo,
          reference: initResult.reference,
          status: 'pending',
          payment_method: paystackService.isEnabled() ? 'paystack' : 'test',
        },
      ])
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      reference: initResult.reference,
      authorizationUrl: initResult.authorizationUrl,
      accessCode: initResult.accessCode,
      paymentId: payment.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}
