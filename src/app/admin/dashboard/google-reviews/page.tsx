'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter, ALL_DATE_FILTERS } from '@/components/admin/DateFilterBar';
import { useSync } from '@/contexts/SyncContext';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Star,
  TrendingUp,
} from 'lucide-react';

interface ThemeResult {
  key: string;
  label: string;
  count: number;
  pct: number;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  action: string;
  why: string;
}

interface ReviewRecord {
  reviewId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  source: 'local_curated_repo' | 'google_places_api';
}

interface GoogleReviewsData {
  dateRange: {
    period: DateFilter;
    start: string;
    end: string;
    display: string;
  };
  source: {
    mode: 'google_places_api' | 'local_curated_repo';
    hasDirectGoogleApiCount: boolean;
    notes: string[];
  };
  profile: {
    businessName: string;
    googleProfileUrl: string;
    googleReviewUrl: string;
    placeUrl: string | null;
    placeId: string | null;
    mapsCid: string | null;
    phone: string | null;
    rating: number | null;
    userRatingCount: number | null;
  };
  metrics: {
    datasetReviewCount: number;
    datasetAverageRating: number;
    profileReviewCount: number;
    profileReviewCountScope: 'google_profile_total' | 'connected_dataset_total';
    reviewsLast30: number;
    reviewsLast90: number;
    lowRatingPct: number;
  };
  distribution: Array<{
    stars: number;
    count: number;
    pct: number;
  }>;
  themes: {
    strengths: ThemeResult[];
    concerns: ThemeResult[];
  };
  recommendations: Recommendation[];
  reviews: ReviewRecord[];
  fetchedAt: string;
}

export default function GoogleReviewsPage() {
  const { syncVersion } = useSync();
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataCache, setDataCache] = useState<Record<DateFilter, GoogleReviewsData | null>>({
    today: null,
    yesterday: null,
    '7days': null,
    '30days': null,
    all: null,
  });

  const data = dataCache[dateFilter];
  const hasAnyCachedData = useMemo(
    () => ALL_DATE_FILTERS.some(filter => dataCache[filter] !== null),
    [dataCache]
  );

  const fetchData = useCallback(async (filter: DateFilter) => {
    try {
      const response = await fetch(`/api/admin/dashboard/google-reviews?period=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch Google reviews data');
      const result = await response.json();
      setDataCache(prev => ({ ...prev, [filter]: result }));
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  useEffect(() => {
    if (dataCache[dateFilter]) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchData(dateFilter).finally(() => setLoading(false));
  }, [dateFilter, dataCache, fetchData]);

  useEffect(() => {
    if (syncVersion > 0) {
      setDataCache({
        today: null,
        yesterday: null,
        '7days': null,
        '30days': null,
        all: null,
      });
      setLoading(true);
      fetchData(dateFilter).finally(() => setLoading(false));
    }
  }, [syncVersion, dateFilter, fetchData]);

  const onFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
  };

  if (loading && !hasAnyCachedData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Google reviews...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error: {error}
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          No Google review data available.
        </div>
      </DashboardLayout>
    );
  }

  const profileRating = data.profile.rating ?? data.metrics.datasetAverageRating;
  const profileCountLabel = data.metrics.profileReviewCountScope === 'google_profile_total'
    ? 'Live Google Profile Count'
    : 'Connected Dataset Count';

  const priorityStyles: Record<Recommendation['priority'], string> = {
    high: 'border-red-300 bg-red-50 text-red-900',
    medium: 'border-amber-300 bg-amber-50 text-amber-900',
    low: 'border-green-300 bg-green-50 text-green-900',
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Google Reviews</h1>
        <p className="text-gray-600 mt-1">
          Customer feedback quality, verbatims, and actionable reputation metrics
        </p>
      </div>

      <DateFilterBar
        dateFilter={dateFilter}
        onFilterChange={onFilterChange}
        dateDisplay={data.dateRange.display}
        color="pink"
        showSync
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            Public Rating
          </div>
          <div className="text-3xl font-bold text-gray-900">{profileRating.toFixed(1)}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            {profileCountLabel}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {data.metrics.profileReviewCount.toLocaleString()}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <MessageSquare className="w-4 h-4 text-pink-500" />
            Reviews In Window
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {data.metrics.datasetReviewCount.toLocaleString()}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Last 30 Days
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {data.metrics.reviewsLast30.toLocaleString()}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Low-Rating Share
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.metrics.lowRatingPct.toFixed(1)}%</div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-1">Data Source Status</div>
            <div className="text-sm text-gray-700">
              {data.source.hasDirectGoogleApiCount ? (
                <span className="inline-flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Live Google aggregate review count is connected.
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                  Live Google review API not connected; analysis currently uses connected local review set.
                </span>
              )}
            </div>
            {data.source.notes.map((note, idx) => (
              <div key={idx} className="text-xs text-gray-500 mt-1">{note}</div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={data.profile.googleProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-black"
            >
              Open Profile <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={data.profile.googleReviewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-600 text-white text-sm hover:bg-pink-700"
            >
              Leave Review Link <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h2>
          <div className="space-y-3">
            {data.distribution.map(row => (
              <div key={row.stars}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{row.stars} stars</span>
                  <span className="text-gray-600">{row.count} ({row.pct.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-pink-300"
                    style={{ width: `${Math.min(100, row.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Theme Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-green-700 mb-2">Strengths</h3>
              <ul className="space-y-2">
                {data.themes.strengths.length === 0 && (
                  <li className="text-sm text-gray-500">No clear recurring strengths in current window.</li>
                )}
                {data.themes.strengths.map(theme => (
                  <li key={theme.key} className="text-sm text-gray-700">
                    <strong>{theme.label}</strong>: {theme.count} mentions ({theme.pct.toFixed(1)}%)
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-700 mb-2">Watch Items</h3>
              <ul className="space-y-2">
                {data.themes.concerns.length === 0 && (
                  <li className="text-sm text-gray-500">No recurring concern themes in current window.</li>
                )}
                {data.themes.concerns.map(theme => (
                  <li key={theme.key} className="text-sm text-gray-700">
                    <strong>{theme.label}</strong>: {theme.count} mentions ({theme.pct.toFixed(1)}%)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Actionable Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.recommendations.map((rec, idx) => (
            <div
              key={`${rec.title}-${idx}`}
              className={`border rounded-lg p-4 ${priorityStyles[rec.priority]}`}
            >
              <div className="text-xs uppercase tracking-wide font-semibold mb-1">
                {rec.priority} Priority
              </div>
              <div className="font-bold mb-1">{rec.title}</div>
              <div className="text-sm mb-1">{rec.action}</div>
              <div className="text-xs opacity-80">{rec.why}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Verbatim Reviews</h2>
        <div className="space-y-3">
          {data.reviews.length === 0 && (
            <div className="text-sm text-gray-500">No verbatims available for this date window.</div>
          )}
          {data.reviews.map(review => (
            <div key={review.reviewId} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="font-semibold text-gray-900">{review.reviewerName}</div>
                <div className="text-xs text-gray-600">
                  {review.rating.toFixed(1)} stars • {review.date} • {review.source === 'google_places_api' ? 'Google API' : 'Connected Dataset'}
                </div>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">"{review.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
