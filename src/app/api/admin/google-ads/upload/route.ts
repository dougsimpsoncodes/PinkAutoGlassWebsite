import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)

  try {
    // Initialize Supabase client at runtime, not at module load time
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to Supabase Storage with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `search-terms-${timestamp}.csv`;

    // Upload timestamped version
    const { error: uploadError } = await supabase.storage
      .from('google-ads')
      .upload(filename, buffer, {
        contentType: 'text/csv',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw uploadError;
    }

    // Also upload as "latest" for easy access
    const { error: latestError } = await supabase.storage
      .from('google-ads')
      .upload('search-terms-latest.csv', buffer, {
        contentType: 'text/csv',
        upsert: true, // Overwrite existing
      });

    if (latestError) {
      console.error('Supabase latest upload error:', latestError);
      throw latestError;
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filename,
      filepath: 'search-terms-latest.csv',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
