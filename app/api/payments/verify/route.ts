/**
 * GET /api/payments/verify?reference=OYA_123456789_ABC123
 * Verify a payment transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helpers';
import { supabase } from '@/lib/supabase';
import { paystackService } from '@/services/paystack';
import { koboToNaira } from '@/lib/payment';
import { PaymentVerifySchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    // Validate reference
    const { reference: validatedReference } = PaymentVerifySchema.parse({
      reference,
    });

    // Verify payment with Paystack
    const verifyResult = await paystackService.verifyPayment({
      reference: validatedReference,
    });

    if (verifyResult.status === 'error') {
      return NextResponse.json(
        { error: verifyResult.message },
        { status: 500 }
      );
    }

    const paystackData = verifyResult.data!;
    const isSuccess = paystackData.status === 'success';

    // Find payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', validatedReference)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify user is the payment creator
    if (payment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to verify this payment' },
        { status: 403 }
      );
    }

    // Update payment status
    const newStatus = isSuccess ? 'completed' : 'failed';
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        transaction_id: paystackData.reference,
        paid_at: isSuccess ? new Date().toISOString() : null,
        failure_reason: isSuccess ? null : 'Payment declined',
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Payment update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    // If payment is successful, update job status
    if (isSuccess) {
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ status: 'accepted' })
        .eq('id', payment.job_id);

      if (jobError) {
        console.error('Job update error:', jobError);
      }
    }

    return NextResponse.json({
      status: 'success',
      data: {
        paymentStatus: newStatus,
        jobId: payment.job_id,
        amount: koboToNaira(payment.amount),
        reference: payment.reference,
        paidAt: isSuccess ? new Date().toISOString() : null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
