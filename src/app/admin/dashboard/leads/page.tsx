'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Search, Filter, DollarSign, Calendar, User, Phone, Mail, MapPin, Car, FileText, X, Check, Clock } from 'lucide-react';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  vehicle_year?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  service_type?: string;
  city?: string;
  state?: string;
  zip?: string;
  quote_amount?: number;
  revenue_amount?: number;
  close_date?: string;
  notes?: string;
  ad_platform?: string;
  utm_campaign?: string;
  first_contact_method?: string;
}

export default function LeadManagementDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});

  useEffect(() => {
    fetchLeads();
  }, [filterStatus]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all'
        ? '/api/admin/leads'
        : `/api/admin/leads?status=${filterStatus}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch leads');

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async () => {
    if (!selectedLead) return;

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLead.id,
          ...editData,
        }),
      });

      if (!response.ok) throw new Error('Failed to update lead');

      // Refresh leads list
      await fetchLeads();

      // Update selected lead
      const updatedLead = { ...selectedLead, ...editData };
      setSelectedLead(updatedLead);
      setEditMode(false);
      setEditData({});

    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      lead.first_name?.toLowerCase().includes(search) ||
      lead.last_name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.phone?.toLowerCase().includes(search) ||
      lead.vehicle_make?.toLowerCase().includes(search)
    );
  });

  const statusOptions = [
    { value: 'all', label: 'All Leads', color: 'gray' },
    { value: 'new', label: 'New', color: 'blue' },
    { value: 'contacted', label: 'Contacted', color: 'yellow' },
    { value: 'quoted', label: 'Quoted', color: 'purple' },
    { value: 'scheduled', label: 'Scheduled', color: 'indigo' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'lost', label: 'Lost', color: 'red' },
  ];

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'gray';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'contacted': return <Phone className="w-4 h-4" />;
      case 'quoted': return <DollarSign className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'completed': return <Check className="w-4 h-4" />;
      case 'lost': return <X className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Calculate summary stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    quoted: leads.filter(l => l.status === 'quoted').length,
    completed: leads.filter(l => l.status === 'completed').length,
    totalRevenue: leads.reduce((sum, l) => sum + (l.revenue_amount || 0), 0),
    avgDealSize: leads.filter(l => l.revenue_amount).length > 0
      ? leads.reduce((sum, l) => sum + (l.revenue_amount || 0), 0) / leads.filter(l => l.revenue_amount).length
      : 0,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leads...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
        <p className="text-gray-600 mt-1">Simple CRM for tracking quotes and revenue</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-2">Total Leads</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600 mb-2">New Leads</div>
          <div className="text-3xl font-bold text-gray-900">{stats.new}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 mb-2">Avg Deal Size</div>
          <div className="text-3xl font-bold text-gray-900">${stats.avgDealSize.toFixed(0)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === option.value
                    ? `bg-${option.color}-600 text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
                {option.value !== 'all' && ` (${leads.filter(l => l.status === option.value).length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  // Service badge color
                  const serviceBadgeColor = lead.service_type === 'repair' ? 'orange' : 'blue';
                  const serviceBadgeText = lead.service_type === 'repair' ? 'REPAIR' : 'REPLACEMENT';

                  // Format date like "Nov 12, 2025 5:27 PM"
                  const formattedDate = new Date(lead.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div className="font-medium text-gray-900">{lead.first_name} {lead.last_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a href={`mailto:${lead.email}`} className="hover:text-pink-600">{lead.email}</a>
                          </div>
                          <div className="flex items-center gap-2 text-gray-900">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${lead.phone}`} className="hover:text-pink-600">{lead.phone}</a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-400" />
                          <div className="text-sm text-gray-900">
                            {lead.vehicle_year} {lead.vehicle_make} {lead.vehicle_model}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {lead.zip || lead.city || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.service_type ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase bg-${serviceBadgeColor}-100 text-${serviceBadgeColor}-800`}>
                            {serviceBadgeText}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-${getStatusColor(lead.status || 'new')}-100 text-${getStatusColor(lead.status || 'new')}-800`}>
                          {getStatusIcon(lead.status || 'new')}
                          {lead.status || 'NEW'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setEditMode(false);
                          }}
                          className="text-pink-600 hover:text-pink-900 font-medium text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedLead.first_name} {selectedLead.last_name}
              </h2>
              <button
                onClick={() => {
                  setSelectedLead(null);
                  setEditMode(false);
                  setEditData({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* CRM Fields (Editable) */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">CRM Information</h3>
                  {!editMode ? (
                    <button
                      onClick={() => {
                        setEditMode(true);
                        setEditData({
                          status: selectedLead.status,
                          quote_amount: selectedLead.quote_amount,
                          revenue_amount: selectedLead.revenue_amount,
                          close_date: selectedLead.close_date,
                          notes: selectedLead.notes,
                        });
                      }}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setEditData({});
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={updateLead}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    {editMode ? (
                      <select
                        value={editData.status || selectedLead.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      >
                        {statusOptions.filter(opt => opt.value !== 'all').map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(selectedLead.status || 'new')}-100 text-${getStatusColor(selectedLead.status || 'new')}-800`}>
                        {getStatusIcon(selectedLead.status || 'new')}
                        {selectedLead.status || 'new'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quote Amount</label>
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.quote_amount ?? selectedLead.quote_amount ?? ''}
                        onChange={(e) => setEditData({ ...editData, quote_amount: parseFloat(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                        placeholder="0.00"
                      />
                    ) : (
                      <div className="text-gray-900">${selectedLead.quote_amount?.toLocaleString() || '-'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Amount</label>
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.revenue_amount ?? selectedLead.revenue_amount ?? ''}
                        onChange={(e) => setEditData({ ...editData, revenue_amount: parseFloat(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                        placeholder="0.00"
                      />
                    ) : (
                      <div className="text-green-600 font-medium">${selectedLead.revenue_amount?.toLocaleString() || '-'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Close Date</label>
                    {editMode ? (
                      <input
                        type="date"
                        value={editData.close_date ?? selectedLead.close_date ?? ''}
                        onChange={(e) => setEditData({ ...editData, close_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      />
                    ) : (
                      <div className="text-gray-900">{selectedLead.close_date || '-'}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  {editMode ? (
                    <textarea
                      value={editData.notes ?? selectedLead.notes ?? ''}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="Add notes about this lead..."
                    />
                  ) : (
                    <div className="text-gray-900 whitespace-pre-wrap">{selectedLead.notes || 'No notes'}</div>
                  )}
                </div>
              </div>

              {/* Customer Info (Read-only) */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="text-gray-900">{selectedLead.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="text-gray-900">{selectedLead.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="text-gray-900">{selectedLead.city}, {selectedLead.state}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Service Type</div>
                    <div className="text-gray-900 capitalize">{selectedLead.service_type || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Vehicle Information</h3>
                <div className="text-gray-900">
                  {selectedLead.vehicle_year} {selectedLead.vehicle_make} {selectedLead.vehicle_model}
                </div>
              </div>

              {/* Attribution */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Marketing Attribution</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Platform</div>
                    <div className="text-gray-900 capitalize">{selectedLead.ad_platform || 'direct'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Campaign</div>
                    <div className="text-gray-900">{selectedLead.utm_campaign || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">First Contact</div>
                    <div className="text-gray-900 capitalize">{selectedLead.first_contact_method || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="text-gray-900">{new Date(selectedLead.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
