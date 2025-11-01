import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
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

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'data', 'google-ads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `search-terms-${timestamp}.csv`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Also save as "latest" for easy access
    const latestPath = join(uploadDir, 'search-terms-latest.csv');
    await writeFile(latestPath, buffer);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filename,
      filepath: latestPath,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
