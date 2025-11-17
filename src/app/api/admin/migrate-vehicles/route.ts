import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)

  try {
    const { makes, models } = await request.json();

    console.log(`📊 Migration request: ${makes?.length || 0} makes, ${models?.length || 0} models`);

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let makesInserted = 0;
    let makesSkipped = 0;
    let modelsInserted = 0;
    let modelsSkipped = 0;

    // Insert makes
    console.log('📝 Inserting vehicle makes...');
    for (const make of makes) {
      const { error } = await supabase
        .from('vehicle_makes')
        .upsert(make, { onConflict: 'id', ignoreDuplicates: true });

      if (error) {
        console.log(`   ⚠️  Skipped make ${make.make}: ${error.message}`);
        makesSkipped++;
      } else {
        makesInserted++;
      }
    }

    console.log(`✅ Makes: ${makesInserted} inserted, ${makesSkipped} skipped`);

    // Insert models
    console.log('📝 Inserting vehicle models...');
    for (const model of models) {
      const { error } = await supabase
        .from('vehicle_models')
        .upsert(model, { onConflict: 'id', ignoreDuplicates: true });

      if (error) {
        modelsSkipped++;
      } else {
        modelsInserted++;
      }

      // Progress indicator
      if (modelsInserted % 100 === 0) {
        console.log(`   Progress: ${modelsInserted}/${models.length}`);
      }
    }

    console.log(`✅ Models: ${modelsInserted} inserted, ${modelsSkipped} skipped`);

    // Verify final counts
    const { count: finalMakes } = await supabase
      .from('vehicle_makes')
      .select('*', { count: 'exact', head: true });

    const { count: finalModels } = await supabase
      .from('vehicle_models')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Final counts: ${finalMakes} makes, ${finalModels} models`);

    return NextResponse.json({
      success: true,
      makesInserted,
      makesSkipped,
      modelsInserted,
      modelsSkipped,
      finalMakes,
      finalModels
    });

  } catch (error: any) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    );
  }
}
