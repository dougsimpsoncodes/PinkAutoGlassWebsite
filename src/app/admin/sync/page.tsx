'use client';

import { useState } from 'react';

export default function SyncPage() {
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, any>>({});

  async function triggerSync(name: string, endpoint: string) {
    setSyncing((prev) => ({ ...prev, [name]: true }));
    setResults((prev) => ({ ...prev, [name]: null }));

    try {
      const response = await fetch(endpoint, { method: 'POST' });
      const data = await response.json();
      setResults((prev) => ({ ...prev, [name]: data }));
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        [name]: { ok: false, error: error.message },
      }));
    } finally {
      setSyncing((prev) => ({ ...prev, [name]: false }));
    }
  }

  const syncs = [
    {
      name: 'Google Ads Campaigns',
      endpoint: '/api/admin/sync/google-ads?days=30',
      description: 'Sync campaign performance data from Google Ads (last 30 days)',
    },
    {
      name: 'Google Ads Search Terms',
      endpoint: '/api/admin/sync/google-ads-search-terms?days=30',
      description: 'Sync search query report from Google Ads (last 30 days)',
    },
    {
      name: 'Google Search Console',
      endpoint: '/api/admin/sync/google-search-console?days=30',
      description: 'Sync organic search performance from GSC (last 30 days)',
    },
    {
      name: 'RingCentral Calls',
      endpoint: '/api/admin/sync/ringcentral?days=30',
      description: 'Sync call logs from RingCentral (last 30 days)',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Sync</h1>
        <p className="text-gray-600 mb-6">
          Manually trigger data synchronization from external APIs
        </p>

        <div className="space-y-4">
          {syncs.map((sync) => (
            <div key={sync.name} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{sync.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{sync.description}</p>

                  {results[sync.name] && (
                    <div
                      className={`mt-3 p-3 rounded text-sm ${
                        results[sync.name].ok
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}
                    >
                      {results[sync.name].ok ? (
                        <div>
                          <div className="font-semibold mb-1">✅ {results[sync.name].message}</div>
                          {results[sync.name].summary && (
                            <div className="space-y-1 text-xs mt-2">
                              <div>
                                Records fetched: {results[sync.name].summary.recordsFetched}
                              </div>
                              <div>New: {results[sync.name].summary.newRecords}</div>
                              <div>Updated: {results[sync.name].summary.updatedRecords}</div>
                              {results[sync.name].summary.errors > 0 && (
                                <div className="text-red-600">
                                  Errors: {results[sync.name].summary.errors}
                                </div>
                              )}
                            </div>
                          )}
                          {results[sync.name].statistics && (
                            <div className="space-y-1 text-xs mt-2">
                              {results[sync.name].statistics.uniqueSearchTerms && (
                                <div>
                                  Unique search terms:{' '}
                                  {results[sync.name].statistics.uniqueSearchTerms}
                                </div>
                              )}
                              {results[sync.name].statistics.totalImpressions && (
                                <div>
                                  Total impressions:{' '}
                                  {results[sync.name].statistics.totalImpressions.toLocaleString()}
                                </div>
                              )}
                              {results[sync.name].statistics.totalClicks && (
                                <div>
                                  Total clicks:{' '}
                                  {results[sync.name].statistics.totalClicks.toLocaleString()}
                                </div>
                              )}
                              {results[sync.name].statistics.totalCost && (
                                <div>
                                  Total cost: $
                                  {results[sync.name].statistics.totalCost.toFixed(2)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold mb-1">❌ Sync Failed</div>
                          <div className="text-xs">{results[sync.name].error}</div>
                          {results[sync.name].details && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs">
                                Show error details
                              </summary>
                              <pre className="mt-2 text-xs overflow-x-auto">
                                {results[sync.name].details}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => triggerSync(sync.name, sync.endpoint)}
                  disabled={syncing[sync.name]}
                  className={`ml-4 px-4 py-2 rounded font-medium text-sm ${
                    syncing[sync.name]
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {syncing[sync.name] ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Syncs run automatically daily at 6am MT via cron job</li>
            <li>• Manual sync is useful for immediate data updates</li>
            <li>• Each sync fetches the last 30 days of data</li>
            <li>• Existing records are updated (upserted) to avoid duplicates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
