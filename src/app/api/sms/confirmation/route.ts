import { NextRequest, NextResponse } from 'next/server';

// TODO: Import Twilio when ready
// import twilio from 'twilio';

interface SMSConfirmationData {
  phone: string;
  referenceNumber: string;
  firstName: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: SMSConfirmationData = await request.json();

    // Validate required fields
    if (!data.phone || !data.referenceNumber || !data.firstName) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, referenceNumber, firstName' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!phoneRegex.test(data.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // TODO: Initialize Twilio client
    /*
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    */

    // Clean phone number for Twilio (remove formatting)
    const cleanPhone = data.phone.replace(/\D/g, '');
    const formattedPhone = `+1${cleanPhone}`;

    // Compose SMS message
    const message = `Hi ${data.firstName}! Your windshield service request has been received. Reference: ${data.referenceNumber}. We'll call you within 15 minutes to confirm your appointment. Pink Auto Glass`;

    // TODO: Send SMS via Twilio
    /*
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log('SMS sent successfully:', {
      sid: twilioMessage.sid,
      to: formattedPhone,
      referenceNumber: data.referenceNumber,
    });
    */

    // For now, just log the SMS content
    console.log('SMS confirmation would be sent:', {
      to: formattedPhone,
      message: message,
      referenceNumber: data.referenceNumber,
    });

    // TODO: Log SMS activity in database
    /*
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: logError } = await supabase
      .from('sms_logs')
      .insert({
        reference_number: data.referenceNumber,
        phone_number: formattedPhone,
        message_body: message,
        twilio_sid: twilioMessage.sid,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('SMS log insertion error:', logError);
    }
    */

    // TODO: Update booking record with SMS confirmation status
    /*
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        sms_confirmation_sent: true,
        sms_confirmation_sent_at: new Date().toISOString(),
      })
      .eq('reference_number', data.referenceNumber);

    if (updateError) {
      console.error('Booking SMS status update error:', updateError);
    }
    */

    return NextResponse.json({
      success: true,
      message: 'SMS confirmation sent successfully',
      // messageSid: twilioMessage.sid, // TODO: Uncomment when Twilio is integrated
    });

  } catch (error) {
    console.error('SMS confirmation error:', error);

    // TODO: Handle specific Twilio errors
    /*
    if (error.code === 21614) {
      // Invalid phone number
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }
    
    if (error.code === 21408) {
      // Permission to send SMS denied
      return NextResponse.json(
        { error: 'SMS delivery not allowed to this number' },
        { status: 400 }
      );
    }
    */

    return NextResponse.json(
      { error: 'Failed to send SMS confirmation' },
      { status: 500 }
    );
  }
}

// TODO: Add GET endpoint for SMS status checking
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const referenceNumber = searchParams.get('ref');

  if (!referenceNumber) {
    return NextResponse.json(
      { error: 'Reference number required' },
      { status: 400 }
    );
  }

  // TODO: Implement SMS status retrieval
  /*
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: smsLogs, error } = await supabase
    .from('sms_logs')
    .select('*')
    .eq('reference_number', referenceNumber)
    .order('sent_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve SMS status' },
      { status: 500 }
    );
  }

  return NextResponse.json({ smsLogs });
  */

  // Placeholder response
  return NextResponse.json({
    smsStatus: {
      referenceNumber,
      status: 'sent',
      message: 'SMS status retrieval not yet implemented'
    }
  });
}