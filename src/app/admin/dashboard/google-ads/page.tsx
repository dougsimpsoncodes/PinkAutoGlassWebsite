'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import {
  Upload,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle,
  Copy,
  ExternalLink,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface SearchTerm {
  term: string;
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
  convRate: number;
  costPerConv?: number;
}

interface AnalysisResults {
  totalClicks: number;
  totalImpressions: number;
  totalCost: number;
  totalConversions: number;
  costPerConversion: number;
  converters: SearchTerm[];
  wasted: SearchTerm[];
  competitors: SearchTerm[];
  highIntent: SearchTerm[];
}

export default function GoogleAdsOptimizer() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileUpload called!', e);
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name);
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file...');
      const response = await fetch('/api/admin/google-ads/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error:', errorData);
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('Upload success:', data);

      // Auto-analyze after upload
      console.log('Starting analysis...');
      await runAnalysis();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      console.log('Fetching analysis...');
      const response = await fetch('/api/admin/google-ads/analyze', {
        method: 'POST',
      });

      console.log('Analysis response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Analysis error:', errorData);
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      console.log('Analysis complete:', data);
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadBidAdjustments = () => {
    if (!analysis) return;

    // Create CSV content with keyword and recommended bid increase
    const csvRows = [
      ['Keyword', 'Current Conv Rate', 'Current CPA', 'Recommended Bid Increase', 'Notes'],
      ...analysis.converters.slice(0, 5).map(term => [
        term.term,
        `${term.convRate.toFixed(1)}%`,
        `$${term.costPerConv?.toFixed(2) || 'N/A'}`,
        '+40%',
        'High performer - increase to capture more traffic'
      ])
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bid-increase-recommendations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getNegativeKeywordsList = () => {
    if (!analysis) return '';

    const keywords = [
      ...analysis.wasted.map(w => w.term),
      ...analysis.competitors.filter(c => c.conversions === 0).map(c => c.term),
    ];

    return keywords.join('\n');
  };


  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Google Ads Optimizer</h1>
            <p className="text-gray-600 mt-1">AI-powered campaign analysis and optimization</p>
          </div>
        </div>
      </div>


      {/* Upload Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Search Terms Report</h2>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>How to export from Google Ads:</strong>
          </p>
          <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
            <li>Go to Google Ads → Campaigns</li>
            <li>Click "Insights and Reports" in top navigation</li>
            <li>Select "Report Editor"</li>
            <li>Choose "Search Terms" report</li>
            <li>Set date range (recommend: Last 30 days)</li>
            <li>Click "Download" → CSV format</li>
          </ol>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
            disabled={uploading || analyzing}
          />
          <label
            htmlFor="csv-upload"
            className={`flex flex-col items-center ${uploading || analyzing ? 'cursor-wait' : 'cursor-pointer'}`}
          >
            {uploading || analyzing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-3"></div>
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
            )}
            <span className="text-lg font-medium text-gray-700">
              {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Click to upload search-terms.csv'}
            </span>
            <span className="text-sm text-gray-500 mt-1">
              {uploading || analyzing ? 'Please wait...' : 'CSV files only'}
            </span>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spend</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${analysis.totalCost.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-pink-600" />
              </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analysis.totalConversions}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cost Per Conv</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${analysis.costPerConversion.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conv Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {((analysis.totalConversions / analysis.totalClicks) * 100).toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Critical: Wasted Spend - Only competitor brands with no engagement */}
          {analysis.wasted.length > 0 && (
            <div className="bg-white shadow-sm border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Competitor Brand Searches - Consider Blocking</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      These competitor brand terms get impressions but NO clicks - they're unlikely to convert
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(getNegativeKeywordsList(), 'wasted-all')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedIndex === 'wasted-all' ? 'Copied!' : 'Copy All Keywords'}
                </button>
              </div>

              <div className="space-y-2">
                {analysis.wasted.slice(0, 10).map((term, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-red-50 rounded-lg border border-red-100"
                  >
                    <p className="font-medium text-gray-900">{term.term}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {term.impressions} impressions • {term.clicks} clicks • ${term.cost.toFixed(2)} spent
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">⚠️ Important Note:</p>
                <p className="text-sm text-gray-700 mb-3">
                  These are COMPETITOR BRAND searches only. We removed terms that got clicks from this list because:
                </p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 mb-3">
                  <li><strong>Clicks = Site visits = Potential customers</strong></li>
                  <li>People might call after visiting (not tracked as conversion)</li>
                  <li>They might fill out a form later or convert days later</li>
                  <li>Even without tracked conversion, site visits have value</li>
                </ul>
                <p className="text-sm font-medium text-gray-900 mb-2">How to add negative keywords:</p>
                <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                  <li>Click "Copy Competitor Negatives" above</li>
                  <li>Go to Google Ads → Campaigns → Keywords → Negative Keywords</li>
                  <li>Click "+ Negative Keywords"</li>
                  <li>Select your campaign</li>
                  <li>Paste the keywords (one per line)</li>
                  <li>Choose "Exact match" for precision</li>
                  <li>Click "Save" - takes effect immediately</li>
                </ol>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-blue-700">
                    Note: This focuses on competitor brands with no engagement. Terms that drove clicks are preserved as potential leads.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Converters */}
          {analysis.converters.length > 0 && (
            <div className="bg-white shadow-sm border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-green-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Top Converting Terms - Increase Bids</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      These terms are winners - download CSV to bulk update bids by +40%
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadBidAdjustments}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Download Bid Adjustments
                </button>
              </div>

              <div className="space-y-2">
                {analysis.converters.slice(0, 5).map((term, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{term.term}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {term.conversions} conversions @ {term.convRate.toFixed(0)}% rate •
                        ${term.costPerConv?.toFixed(2)} CPA • {term.clicks} clicks
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-700">
                        {term.convRate.toFixed(0)}% Conv Rate
                      </p>
                      <p className="text-xs text-gray-600">
                        ${term.costPerConv?.toFixed(2)} CPA
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">How to bulk increase bids:</p>
                <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                  <li>Click "Download Bid Adjustments" above to get the CSV file</li>
                  <li>Go to Google Ads → Keywords tab</li>
                  <li>Select each keyword from the CSV</li>
                  <li>Use "Edit" → Modify max CPC bids by +40%</li>
                  <li>Or use Google Ads Editor for bulk bid updates</li>
                  <li>Monitor for 7 days and adjust as needed</li>
                </ol>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-green-700">
                    💡 Expected Impact: +40% conversions while maintaining profitable CPA
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Competitor Searches */}
          {analysis.competitors.length > 0 && (
            <div className="bg-white shadow-sm border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Competitor Brand Searches</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Your ads show when people search for competitors - add as negative unless converting
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {analysis.competitors.slice(0, 10).map((term, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{term.term}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {term.impressions} impressions • {term.clicks} clicks • ${term.cost.toFixed(2)} spent
                      </p>
                    </div>
                    {term.conversions > 0 ? (
                      <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full font-medium">
                        ✓ Converting - Keep
                      </span>
                    ) : (
                      <button
                        onClick={() => copyToClipboard(term.term, String(1000 + idx))}
                        className="px-3 py-1 text-sm bg-white border border-yellow-300 text-yellow-700 rounded hover:bg-yellow-50 transition-colors"
                      >
                        {copiedIndex === String(1000 + idx) ? 'Copied!' : 'Add as Negative'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missed Opportunities */}
          {analysis.highIntent.length > 0 && (
            <div className="bg-white shadow-sm border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Missed Opportunities - Improve Ad Copy</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      High-intent searches showing your ads but getting zero clicks - your ad copy needs work
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    analysis.highIntent.slice(0, 5).map(t => t.term).join('\n'),
                    'highintent-all'
                  )}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedIndex === 'highintent-all' ? 'Copied!' : 'Copy All Keywords'}
                </button>
              </div>

              <div className="space-y-2">
                {analysis.highIntent.slice(0, 5).map((term, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-100"
                  >
                    <p className="font-medium text-gray-900">{term.term}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {term.impressions} impressions • 0 clicks (0% CTR)
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Recommended ad copy improvements:</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• <strong>For "near me" searches:</strong> Emphasize "Mobile Service - We Come To You"</li>
                  <li>• <strong>For "chip repair":</strong> Highlight "$50 Chip Repair" in headline</li>
                  <li>• <strong>For "windshield replacement":</strong> Add "Same Day Service" and price guarantee</li>
                  <li>• <strong>All ads:</strong> Include location (Colorado Springs), phone number, insurance acceptance</li>
                </ul>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links to Google Ads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="https://ads.google.com/aw/campaigns"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Open Campaigns</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://ads.google.com/aw/keywords/negatives"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Negative Keywords</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://ads.google.com/aw/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Ads & Extensions</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://ads.google.com/aw/reporting"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Reports</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        </>
      )}

      {analyzing && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing your campaign data...</p>
        </div>
      )}
    </DashboardLayout>
  );
}
