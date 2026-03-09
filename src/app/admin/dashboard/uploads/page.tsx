'use client';

import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Upload, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Loader2, RadioTower } from 'lucide-react';
import type { ParsedInvoice } from '@/app/api/admin/parse-invoice/route';

type Step = 'upload' | 'preview' | 'results';

interface ImportResults {
  imported: number;
  skipped: number;
  matched: number;
  reviewsScheduled: number;
  matchedJobs: { invoice_number: string; customer_name: string; customer_phone: string; total_revenue: number; match_confidence: string }[];
  unmatched: { invoice_number: string; customer_name: string; customer_phone: string; total_revenue: number }[];
  errors: string[];
}

export default function UploadsPage() {
  const [step, setStep] = useState<Step>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [invoices, setInvoices] = useState<ParsedInvoice[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<ImportResults | null>(null);
  const [parseError, setParseError] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)
    );
    setFiles(prev => [...prev, ...dropped].slice(0, 5));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selected].slice(0, 5));
    }
  };

  const handleParse = async () => {
    if (files.length === 0) return;
    setParsing(true);
    setParseError('');

    try {
      // Send one file at a time to stay under Vercel's 4.5MB body limit
      const allInvoices = await Promise.all(files.map(async (file) => {
        const formData = new FormData();
        formData.append('files', file);
        const res = await fetch('/api/admin/parse-invoice', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Parse failed');
        return data.invoices[0];
      }));

      setInvoices(allInvoices);
      setStep('preview');
    } catch (err: any) {
      setParseError(err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/admin/import-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setResults(data);
      setStep('results');
    } catch (err: any) {
      setParseError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const toggleRow = (i: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const reset = () => {
    setStep('upload');
    setFiles([]);
    setInvoices([]);
    setResults(null);
    setParseError('');
    setExpandedRows(new Set());
  };

  const validInvoices = invoices.filter(i => !i.parse_error);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice Upload</h1>
            <p className="text-gray-500 mt-1">Upload Omega invoice screenshots to sync revenue and close the loop on lead attribution.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
            <RadioTower className="w-4 h-4" />
            Market toggle coming soon
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-4 mb-8">
          {(['upload', 'preview', 'results'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-pink-600 text-white' :
                (step === 'preview' && s === 'upload') || (step === 'results') ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {((step === 'preview' && s === 'upload') || step === 'results') && s !== step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>
                {s === 'upload' ? 'Upload' : s === 'preview' ? 'Review' : 'Done'}
              </span>
              {i < 2 && <div className="w-12 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              className={`border-2 border-dashed rounded-xl p-16 text-center transition-colors ${
                dragging ? 'border-pink-400 bg-pink-50' : 'border-gray-300 hover:border-pink-400'
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-1">Drop invoice screenshots here</p>
              <p className="text-sm text-gray-500 mb-6">PNG or JPG, up to 5 files, max 10MB each</p>
              <label className="cursor-pointer bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                Choose Files
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">{files.length} file{files.length > 1 ? 's' : ''} selected:</p>
                <ul className="space-y-2">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {f.name} ({(f.size / 1024).toFixed(0)}KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {parseError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {parseError}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleParse}
                disabled={files.length === 0 || parsing}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white font-semibold py-2 px-8 rounded-lg transition-colors"
              >
                {parsing && <Loader2 className="w-4 h-4 animate-spin" />}
                {parsing ? 'Parsing with AI...' : 'Parse Invoices'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {validInvoices.length} invoice{validInvoices.length !== 1 ? 's' : ''} parsed
                  {invoices.length > validInvoices.length && (
                    <span className="ml-2 text-red-500 text-sm">
                      ({invoices.length - validInvoices.length} failed)
                    </span>
                  )}
                </h2>
                <span className="text-sm text-gray-500">Review before importing</span>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left w-6"></th>
                    <th className="px-4 py-3 text-left">Job #</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Vehicle</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv, i) => (
                    <>
                      <tr
                        key={i}
                        className={`cursor-pointer hover:bg-gray-50 ${inv.parse_error ? 'bg-red-50' : ''}`}
                        onClick={() => !inv.parse_error && toggleRow(i)}
                      >
                        <td className="px-4 py-3 text-gray-400">
                          {!inv.parse_error && (
                            expandedRows.has(i)
                              ? <ChevronDown className="w-4 h-4" />
                              : <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{inv.job_number || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{inv.invoice_date || '—'}</td>
                        <td className="px-4 py-3 text-gray-900">{inv.customer_name || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{inv.customer_phone || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {inv.vehicle_year} {inv.vehicle_make} {inv.vehicle_model}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          ${inv.total?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3">
                          {inv.parse_error
                            ? <span className="text-xs text-red-600 flex items-center gap-1" title={inv.parse_error}><AlertCircle className="w-3 h-3" />Failed</span>
                            : <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Ready</span>
                          }
                        </td>
                      </tr>
                      {inv.parse_error && (
                        <tr key={`${i}-error`} className="bg-red-50">
                          <td colSpan={8} className="px-8 py-2 text-xs text-red-600">
                            Error: {inv.parse_error}
                          </td>
                        </tr>
                      )}
                      {expandedRows.has(i) && !inv.parse_error && (
                        <tr key={`${i}-expanded`} className="bg-gray-50">
                          <td colSpan={8} className="px-8 py-4">
                            <div className="grid grid-cols-2 gap-6 text-sm">
                              <div>
                                <p className="font-medium text-gray-700 mb-2">Customer</p>
                                <p className="text-gray-600">{inv.customer_name}</p>
                                <p className="text-gray-600">{inv.customer_phone}</p>
                                <p className="text-gray-600">{inv.customer_email}</p>
                                <p className="text-gray-500 text-xs mt-1">{inv.customer_address}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 mb-2">Vehicle</p>
                                <p className="text-gray-600">{inv.vehicle_year} {inv.vehicle_make} {inv.vehicle_model}</p>
                                <p className="text-gray-500 text-xs">VIN: {inv.vin}</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="font-medium text-gray-700 mb-2 text-sm">Line Items</p>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-gray-500">
                                    <th className="text-left py-1">Part #</th>
                                    <th className="text-left py-1">Description</th>
                                    <th className="text-right py-1">Cost</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {inv.line_items.map((item, j) => (
                                    <tr key={j} className="border-t border-gray-200">
                                      <td className="py-1 text-gray-500">{item.part_number}</td>
                                      <td className="py-1 text-gray-700">{item.description}</td>
                                      <td className="py-1 text-right text-gray-900">${item.cost.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="mt-2 text-right text-xs text-gray-600 space-y-1">
                                <p>Subtotal: ${inv.subtotal.toFixed(2)}</p>
                                <p>Tax: ${inv.tax_amount.toFixed(2)}</p>
                                <p className="font-bold text-gray-900">Total: ${inv.total.toFixed(2)}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {parseError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {parseError}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={reset} className="text-gray-600 hover:text-gray-900 font-medium py-2 px-4">
                Start Over
              </button>
              <button
                onClick={handleImport}
                disabled={validInvoices.length === 0 || importing}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white font-semibold py-2 px-8 rounded-lg transition-colors"
              >
                {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                {importing ? 'Importing...' : `Import ${validInvoices.length} Invoice${validInvoices.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && results && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <p className="text-3xl font-bold text-gray-900">{results.imported}</p>
                <p className="text-sm text-gray-500 mt-1">Invoices imported</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <p className="text-3xl font-bold text-green-600">{results.matched}</p>
                <p className="text-sm text-gray-500 mt-1">Leads matched</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <p className="text-3xl font-bold text-orange-500">{results.unmatched.length}</p>
                <p className="text-sm text-gray-500 mt-1">Unmatched jobs</p>
              </div>
              <div className="bg-white rounded-xl border border-pink-200 p-6 text-center">
                <p className="text-3xl font-bold text-pink-600">{results.reviewsScheduled ?? 0}</p>
                <p className="text-sm text-gray-500 mt-1">Review requests sent</p>
              </div>
            </div>

            {/* Matched jobs */}
            {results.matchedJobs?.length > 0 && (
              <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
                <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                  <h3 className="font-semibold text-green-800">Matched Jobs</h3>
                  <p className="text-sm text-green-600 mt-0.5">These jobs were linked to an existing lead</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Job #</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">Match</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.matchedJobs.map((job, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium">{job.invoice_number}</td>
                        <td className="px-4 py-3 text-gray-700">{job.customer_name}</td>
                        <td className="px-4 py-3 text-gray-500">{job.customer_phone || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            job.match_confidence === 'exact'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {job.match_confidence}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">${job.total_revenue?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Unmatched jobs */}
            {results.unmatched.length > 0 && (
              <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
                <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
                  <h3 className="font-semibold text-orange-800">Unmatched Jobs</h3>
                  <p className="text-sm text-orange-600 mt-0.5">These jobs have no matching lead — no phone, email, or name match found</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Job #</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.unmatched.map((job, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium">{job.invoice_number}</td>
                        <td className="px-4 py-3 text-gray-700">{job.customer_name}</td>
                        <td className="px-4 py-3 text-gray-500">{job.customer_phone || '—'}</td>
                        <td className="px-4 py-3 text-right font-medium">${job.total_revenue?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Errors */}
            {results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="font-medium text-red-800 mb-2">Errors ({results.errors.length})</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {results.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={reset} className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-8 rounded-lg transition-colors">
                Upload More
              </button>
              <a href="/admin/dashboard/leads" className="text-pink-600 hover:text-pink-700 font-medium py-2 px-4">
                View Leads →
              </a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
