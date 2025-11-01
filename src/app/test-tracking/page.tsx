'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TestTracking() {
  const [result, setResult] = useState<any>(null);

  const testInsert = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('Testing conversion insert...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Has anon key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const testData = {
      session_id: 'test_session_' + Date.now(),
      visitor_id: 'test_visitor',
      event_type: 'phone_click',
      event_category: 'conversion',
      page_path: '/test',
      button_text: 'Call Now',
      button_location: 'test',
      utm_source: 'test',
      device_type: 'desktop',
    };

    console.log('Attempting to insert:', testData);

    const { data, error } = await supabase
      .from('conversion_events')
      .insert(testData);

    console.log('Insert result:', { data, error });
    setResult({ data, error: error?.message || null });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Conversion Tracking</h1>

      <button
        onClick={testInsert}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
      >
        Test Insert
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
