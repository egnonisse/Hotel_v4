import { supabase } from './supabase';

export async function sendBookingConfirmation(booking: any) {
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('type', 'booking_confirmation')
    .single();

  if (!template) return;

  const emailContent = template.content
    .replace('{{guest_name}}', booking.customer.name)
    .replace('{{check_in_date}}', new Date(booking.check_in_date).toLocaleDateString())
    .replace('{{check_out_date}}', new Date(booking.check_out_date).toLocaleDateString())
    .replace('{{room_name}}', booking.room.name)
    .replace('{{total_amount}}', booking.total_price.toFixed(2))
    .replace('{{booking_reference}}', booking.id)
    .replace('{{payment_instructions}}', getPaymentInstructions(booking));

  await supabase.auth.admin.createUser({
    email: booking.customer.email,
    email_confirm: true,
    user_metadata: {
      booking_id: booking.id
    }
  });
}

export async function sendPaymentConfirmation(booking: any) {
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('type', 'payment_confirmation')
    .single();

  if (!template) return;

  const emailContent = template.content
    .replace('{{guest_name}}', booking.customer.name)
    .replace('{{amount}}', booking.total_price.toFixed(2))
    .replace('{{payment_method}}', booking.payment_method)
    .replace('{{transaction_id}}', booking.payment_reference)
    .replace('{{date}}', new Date().toLocaleDateString());

  await supabase.auth.admin.createUser({
    email: booking.customer.email,
    email_confirm: true,
    user_metadata: {
      payment_id: booking.payment_reference
    }
  });
}

export async function sendCancellationConfirmation(booking: any) {
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('type', 'booking_cancellation')
    .single();

  if (!template) return;

  const emailContent = template.content
    .replace('{{guest_name}}', booking.customer.name)
    .replace('{{booking_reference}}', booking.id)
    .replace('{{cancellation_reason}}', booking.cancellation_reason || 'Not provided')
    .replace('{{refund_amount}}', calculateRefundAmount(booking));

  await supabase.auth.admin.createUser({
    email: booking.customer.email,
    email_confirm: true,
    user_metadata: {
      cancellation_id: booking.id
    }
  });
}

function getPaymentInstructions(booking: any): string {
  switch (booking.payment_method) {
    case 'mobile_money':
      return `
        Please follow these steps to complete your payment:
        1. Dial *123# on your mobile phone
        2. Select "Send Money"
        3. Enter the following number: ${booking.payment_phone}
        4. Enter amount: ${booking.total_price.toFixed(2)}
        5. Enter your PIN to confirm
        6. Use booking reference ${booking.id} as the payment description
      `;
    case 'bank_transfer':
      return `
        Please transfer the payment to:
        Bank: Demo Bank
        Account Name: Hotel Demo
        Account Number: 1234567890
        Reference: ${booking.id}
      `;
    default:
      return 'Please pay at the hotel reception during check-in.';
  }
}

function calculateRefundAmount(booking: any): string {
  const now = new Date();
  const checkIn = new Date(booking.check_in_date);
  const daysUntilCheckIn = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Refund policy:
  // - Full refund if cancelled 7+ days before check-in
  // - 50% refund if cancelled 3-7 days before check-in
  // - No refund if cancelled less than 3 days before check-in
  if (daysUntilCheckIn >= 7) {
    return booking.total_price.toFixed(2);
  } else if (daysUntilCheckIn >= 3) {
    return (booking.total_price * 0.5).toFixed(2);
  } else {
    return '0.00';
  }
}