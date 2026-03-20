'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
  ChevronLeft,
  FileText,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';

interface Invoice {
  id: string;
  omega_invoice_id: string;
  invoice_number: string;
  install_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  vehicle_year: number;
  vehicle_make: string;
  vehicle_model: string;
  vin: string;
  job_type: string;
  parts_cost: number;
  labor_cost: number;
  tax_amount: number;
  total_revenue: number;
  payment_method: string;
  payment_status: string;
  status: string;
  matched_lead_id: string | null;
  match_confidence: string | null;
  matched_at: string | null;
  created_at: string;
  updated_at: string;
}

interface InvoiceDetail extends Invoice {
  raw_data: {
    source_filename?: string;
    scheduled_date?: string;
    customer_address?: string;
    line_items?: { part_number: string; description: string; list_price: number; cost: number }[];
    subtotal?: number;
    balance?: number;
    payment_reference?: string;
  } | null;
}

// Server sort keys map to DB columns
type SortKey = 'invoice_number' | 'install_date' | 'customer_name' | 'customer_phone'
  | 'vehicle_make' | 'job_type' | 'parts_cost' | 'labor_cost' | 'total_revenue'
  | 'payment_status' | 'match_confidence' | 'created_at';

function splitName(full: string): { first: string; last: string } {
  if (!full) return { first: '', last: '' };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function formatCurrency(val: number | null): string {
  if (val == null) return '—';
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SortIcon({ column, sortColumn, sortDirection }: { column: SortKey; sortColumn: SortKey; sortDirection: 'asc' | 'desc' }) {
  if (sortColumn !== column) return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 opacity-40 inline" />;
  return sortDirection === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 ml-1 inline" />
    : <ChevronDown className="w-3.5 h-3.5 ml-1 inline" />;
}

function MatchBadge({ leadId, confidence }: { leadId: string | null; confidence: string | null }) {
  if (!leadId) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">Unmatched</span>;
  }
  const colors = confidence === 'exact'
    ? 'bg-green-100 text-green-700'
    : 'bg-yellow-100 text-yellow-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
      {confidence === 'exact' ? 'Exact' : 'Likely'}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const colors = status === 'paid'
    ? 'bg-green-100 text-green-700'
    : 'bg-orange-100 text-orange-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
      {status === 'paid' ? 'Paid' : 'Partial'}
    </span>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortColumn, setSortColumn] = useState<SortKey>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Expanded row detail (loaded on demand)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [rowDetails, setRowDetails] = useState<Record<string, InvoiceDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        sort: sortColumn,
        dir: sortDirection,
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/invoices?${params}`);
      const data = await res.json();
      if (data.ok) {
        setInvoices(data.invoices);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        setError(data.error || 'Failed to load invoices');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, sortColumn, sortDirection, search]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Debounced search
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  const toggleSort = (col: SortKey) => {
    if (sortColumn === col) {
      setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const toggleExpand = async (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
      setExpandedRows(next);
      return;
    }
    next.add(id);
    setExpandedRows(next);

    // Load detail on demand if not cached
    if (!rowDetails[id]) {
      setLoadingDetails(prev => new Set(prev).add(id));
      try {
        const res = await fetch(`/api/admin/invoices/${id}`);
        const data = await res.json();
        if (data.ok) {
          setRowDetails(prev => ({ ...prev, [id]: data.invoice }));
        }
      } catch {
        // silent — detail section is supplementary
      } finally {
        setLoadingDetails(prev => {
          const s = new Set(prev);
          s.delete(id);
          return s;
        });
      }
    }
  };

  const thClass = 'px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none whitespace-nowrap';
  const tdClass = 'px-3 py-2 text-sm text-gray-700 whitespace-nowrap';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-pink-600" />
              Invoices
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {total} uploaded invoices
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, job #, VIN..."
            value={searchInput}
            onChange={e => handleSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
            <span className="ml-2 text-gray-500">Loading invoices...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-8 px-2"></th>
                    <th className={thClass} onClick={() => toggleSort('invoice_number')}>Job # <SortIcon column="invoice_number" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass} onClick={() => toggleSort('install_date')}>Date <SortIcon column="install_date" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass} onClick={() => toggleSort('customer_name')}>First <SortIcon column="customer_name" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass}>Last</th>
                    <th className={thClass} onClick={() => toggleSort('customer_phone')}>Phone <SortIcon column="customer_phone" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass} onClick={() => toggleSort('vehicle_make')}>Vehicle <SortIcon column="vehicle_make" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass} onClick={() => toggleSort('job_type')}>Type <SortIcon column="job_type" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass} onClick={() => toggleSort('parts_cost')}>Parts <SortIcon column="parts_cost" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass} onClick={() => toggleSort('labor_cost')}>Labor <SortIcon column="labor_cost" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass} onClick={() => toggleSort('total_revenue')}>Total <SortIcon column="total_revenue" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass} onClick={() => toggleSort('payment_status')}>Payment <SortIcon column="payment_status" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass} onClick={() => toggleSort('match_confidence')}>Match <SortIcon column="match_confidence" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                    <th className={thClass} onClick={() => toggleSort('created_at')}>Uploaded <SortIcon column="created_at" sortColumn={sortColumn} sortDirection={sortDirection} /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="text-center py-10 text-gray-400">
                        {search ? 'No invoices match your search' : 'No invoices uploaded yet'}
                      </td>
                    </tr>
                  ) : (
                    invoices.map(inv => {
                      const { first, last } = splitName(inv.customer_name);
                      const isExpanded = expandedRows.has(inv.id);
                      const detail = rowDetails[inv.id];
                      const isLoadingDetail = loadingDetails.has(inv.id);
                      return (
                        <>
                          <tr
                            key={inv.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleExpand(inv.id)}
                          >
                            <td className="px-2 py-2 text-gray-400">
                              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </td>
                            <td className={tdClass + ' font-mono font-medium'}>{inv.invoice_number}</td>
                            <td className={tdClass}>{formatDate(inv.install_date)}</td>
                            <td className={tdClass}>{first}</td>
                            <td className={tdClass + ' font-medium'}>{last}</td>
                            <td className={tdClass}>{formatPhone(inv.customer_phone)}</td>
                            <td className={tdClass}>{[inv.vehicle_year, inv.vehicle_make, inv.vehicle_model].filter(Boolean).join(' ')}</td>
                            <td className={tdClass}>{inv.job_type || '—'}</td>
                            <td className={tdClass + ' text-right'}>{formatCurrency(inv.parts_cost)}</td>
                            <td className={tdClass + ' text-right'}>{formatCurrency(inv.labor_cost)}</td>
                            <td className={tdClass + ' text-right font-semibold'}>{formatCurrency(inv.total_revenue)}</td>
                            <td className={tdClass}><PaymentBadge status={inv.payment_status} /></td>
                            <td className={tdClass}><MatchBadge leadId={inv.matched_lead_id} confidence={inv.match_confidence} /></td>
                            <td className={tdClass + ' text-gray-500'}>{formatDate(inv.created_at)}</td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${inv.id}-detail`} className="bg-gray-50">
                              <td colSpan={14} className="px-6 py-4">
                                {isLoadingDetail ? (
                                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading details...
                                  </div>
                                ) : detail ? (
                                  <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500 block text-xs">Email</span>
                                        <span>{detail.customer_email || '—'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block text-xs">VIN</span>
                                        <span className="font-mono text-xs">{detail.vin || '—'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block text-xs">Address</span>
                                        <span>{detail.raw_data?.customer_address || '—'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block text-xs">Scheduled Date</span>
                                        <span>{detail.raw_data?.scheduled_date ? formatDate(detail.raw_data.scheduled_date) : '—'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block text-xs">Subtotal</span>
                                        <span>{formatCurrency(detail.raw_data?.subtotal ?? null)}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block text-xs">Tax</span>
                                        <span>{formatCurrency(detail.tax_amount)}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block text-xs">Balance</span>
                                        <span>{formatCurrency(detail.raw_data?.balance ?? null)}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block text-xs">Payment Method</span>
                                        <span>{detail.payment_method || '—'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block text-xs">Payment Ref</span>
                                        <span>{detail.raw_data?.payment_reference || '—'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block text-xs">Source File</span>
                                        <span className="text-xs">{detail.raw_data?.source_filename || '—'}</span>
                                      </div>
                                      {detail.matched_lead_id && (
                                        <div>
                                          <span className="text-gray-500 block text-xs">Matched Lead</span>
                                          <a href={`/admin/dashboard/leads?search=${encodeURIComponent(detail.customer_phone || '')}`} className="text-pink-600 hover:underline text-xs flex items-center gap-1">
                                            <LinkIcon className="w-3 h-3" /> View Lead
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                    {detail.raw_data?.line_items && detail.raw_data.line_items.length > 0 && (
                                      <div className="mt-4">
                                        <span className="text-gray-500 text-xs font-semibold block mb-1">Line Items</span>
                                        <table className="w-full text-xs">
                                          <thead>
                                            <tr className="text-gray-500 border-b">
                                              <th className="text-left py-1 pr-4">Part #</th>
                                              <th className="text-left py-1 pr-4">Description</th>
                                              <th className="text-right py-1 pr-4">List Price</th>
                                              <th className="text-right py-1">Cost</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {detail.raw_data.line_items.map((li, idx) => (
                                              <tr key={idx} className="border-b border-gray-100">
                                                <td className="py-1 pr-4 font-mono">{li.part_number || '—'}</td>
                                                <td className="py-1 pr-4">{li.description}</td>
                                                <td className="py-1 pr-4 text-right">{formatCurrency(li.list_price)}</td>
                                                <td className="py-1 text-right">{formatCurrency(li.cost)}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-400">Details unavailable</div>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages} ({total} invoices)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
