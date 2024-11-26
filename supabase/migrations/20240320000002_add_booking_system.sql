-- Add payment and cancellation fields to room_reservations
ALTER TABLE room_reservations
ADD COLUMN payment_method TEXT CHECK (payment_method IN ('mobile_money', 'bank_transfer', 'cash')),
ADD COLUMN payment_phone TEXT,
ADD COLUMN payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
ADD COLUMN payment_reference TEXT,
ADD COLUMN refund_amount DECIMAL(10, 2),
ADD COLUMN refund_status TEXT CHECK (refund_status IN ('pending', 'completed', 'failed')),
ADD COLUMN refund_reference TEXT;

-- Create email_templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create booking_history table for audit trail
CREATE TABLE booking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES room_reservations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger to track booking history
CREATE OR REPLACE FUNCTION track_booking_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO booking_history (reservation_id, action, details, performed_by)
  VALUES (
    NEW.id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 
        CASE
          WHEN NEW.status != OLD.status THEN 'status_updated'
          WHEN NEW.payment_status != OLD.payment_status THEN 'payment_updated'
          ELSE 'modified'
        END
      ELSE 'deleted'
    END,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON room_reservations
FOR EACH ROW EXECUTE FUNCTION track_booking_history();

-- Insert default email templates
INSERT INTO email_templates (type, subject, content) VALUES
('booking_confirmation', 'Booking Confirmation - {{booking_reference}}',
'Dear {{guest_name}},

Thank you for choosing our hotel. Your booking has been confirmed.

Booking Details:
- Check-in: {{check_in_date}}
- Check-out: {{check_out_date}}
- Room: {{room_name}}
- Total Amount: ${{total_amount}}
- Booking Reference: {{booking_reference}}

Payment Instructions:
{{payment_instructions}}

If you have any questions, please don''t hesitate to contact us.

Best regards,
Hotel Management'),

('payment_confirmation', 'Payment Confirmation - ${{amount}}',
'Dear {{guest_name}},

We have received your payment of ${{amount}} via {{payment_method}}.

Transaction Details:
- Amount: ${{amount}}
- Transaction ID: {{transaction_id}}
- Date: {{date}}

Thank you for your payment.

Best regards,
Hotel Management'),

('booking_cancellation', 'Booking Cancellation Confirmation',
'Dear {{guest_name}},

Your booking (Reference: {{booking_reference}}) has been cancelled.

Cancellation Reason: {{cancellation_reason}}

Refund Amount: ${{refund_amount}}

The refund will be processed according to your original payment method.

We hope to welcome you another time.

Best regards,
Hotel Management');

-- Add indexes for better performance
CREATE INDEX idx_reservations_payment_status ON room_reservations(payment_status);
CREATE INDEX idx_reservations_dates ON room_reservations(check_in_date, check_out_date);
CREATE INDEX idx_booking_history_reservation ON booking_history(reservation_id);

-- Add RLS policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to email templates for authenticated users"
ON email_templates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow read access to booking history for staff and admins"
ON booking_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.role IN ('super_admin', 'hotel_admin')
      OR (
        profiles.role = 'staff'
        AND EXISTS (
          SELECT 1 FROM staff_permissions
          WHERE staff_permissions.profile_id = profiles.id
          AND staff_permissions.can_manage_bookings = true
        )
      )
    )
  )
);