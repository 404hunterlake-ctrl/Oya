/**
 * POST /api/webhooks/paystack
 * Receive webhook events from Paystack
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { paystackService } from '@/services/paystack';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature
    if (!signature) {
      console.warn('Missing webhook signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    if (!paystackService.verifyWebhookSignature(signature, body)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      // Find payment by reference
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('reference', reference)
        .single();

      if (paymentError || !payment) {
        console.warn(`Payment not found for reference: ${reference}`);
        return NextResponse.json({ status: 'received' });
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_id: reference,
          paid_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Payment update error:', updateError);
        return NextResponse.json({ status: 'received' });
      }

      // Update job status
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ status: 'accepted' })
        .eq('id', payment.job_id);

      if (jobError) {
        console.error('Job update error:', jobError);
      }

      console.log(`Payment successful: ${reference}`);
    }

    if (event.event === 'charge.failed') {
      const reference = event.data.reference;

      // Find payment by reference
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('reference', reference)
        .single();

      if (paymentError || !payment) {
        console.warn(`Payment not found for reference: ${reference}`);
        return NextResponse.json({ status: 'received' });
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: event.data.failure_reason || 'Payment declined',
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Payment update error:', updateError);
      }

      console.log(`Payment failed: ${reference}`);
    }

    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
