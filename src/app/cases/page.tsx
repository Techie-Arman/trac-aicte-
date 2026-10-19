'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Plus,
  Eye,
  Lock,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { dataStore } from '@/lib/store';
import { StatusBadge, BureauBadge } from '@/components/Badges';
import { CaseStatus } from '@/types';

function CasesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialBureau = searchParams.get('bureau') || 'ALL';
  const initialQuick = (searchParams.get('filter') === 'overdue' ? 'overdue' : searchParams.get('filter') === 'unresolved_id' ? 'unresolved_id' : 'all');
  const initialRegion = searchParams.get('region') || 'ALL';
  const initialCategory = searchParams.get('category') || 'ALL';

  const currentUser = dataStore.getCurrentUser();
  const allCases = dataStore.getComplaints();

  const [search, setSearch] = useState(initialSearch);
  const [bureauFilter, setBureauFilter] = useState<string>(initialBureau);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [regionFilter, setRegionFilter] = useState<string>(initialRegion);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'overdue' | 'unresolved_id'>(initialQuick);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Extract distinct categories and regions for dropdowns
  const categories = useMemo(() => {
    const set = new Set<string>();
    allCases.forEach(c => { if (c.category) set.add(c.category); });
    return Array.from(set).sort();
  }, [allCases]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    allCases.forEach(c => {
      if (c.institution?.region) set.add(c.institution.region);
    });
    return Array.from(set).sort();
  }, [allCases]);

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
    if (initialStatus !== 'ALL') setStatusFilter(initialStatus);
    if (initialBureau !== 'ALL') setBureauFilter(initialBureau);
    if (initialQuick !== 'all') setQuickFilter(initialQuick);
    if (initialRegion !== 'ALL') setRegionFilter(initialRegion);
    if (initialCategory !== 'ALL') setCategoryFilter(initialCategory);
  }, [initialSearch, initialStatus, initialBureau, initialQuick, initialRegion, initialCategory]);

  const filteredCases = useMemo(() => {
    return allCases.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.case_number.toLowerCase().includes(q) ||
        c.institution_name_raw.toLowerCase().includes(q) ||
        (c.permanent_id_raw && c.permanent_id_raw.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);

      const matchesBureau = bureauFilter === 'ALL' || c.bureau_code === bureauFilter;
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesRegion = regionFilter === 'ALL' || (c.institution?.region === regionFilter);
      const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;

      let matchesDateFrom = true;
      if (dateFrom) {
        matchesDateFrom = new Date(c.date_received) >= new Date(dateFrom);
      }

      let matchesDateTo = true;
      if (dateTo) {
        matchesDateTo = new Date(c.date_received) <= new Date(dateTo + 'T23:59:59.999Z');
      }

      let matchesQuick = true;
      if (quickFilter === 'overdue') {
        matchesQuick =
          c.status !== 'disposed' &&
          Boolean(c.expected_disposal_date) &&
          new Date(c.expected_disposal_date!) < new Date();
      } else if (quickFilter === 'unresolved_id') {
        matchesQuick = !c.permanent_id_raw;
      }

      return matchesSearch && matchesBureau && matchesStatus && matchesRegion && matchesCategory && matchesDateFrom && matchesDateTo && matchesQuick;
    });
  }, [allCases, search, bureauFilter, statusFilter, regionFilter, categoryFilter, dateFrom, dateTo, quickFilter]);

  const hasActiveFilters =
    Boolean(search) ||
    bureauFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    regionFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    quickFilter !== 'all';

  const resetAllFilters = () => {
    setSearch('');
    setBureauFilter('ALL');
    setStatusFilter('ALL');
    setRegionFilter('ALL');
    setCategoryFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setQuickFilter('all');
    setCurrentPage(1);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, bureauFilter, statusFilter, regionFilter, categoryFilter, dateFrom, dateTo, quickFilter]);

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  // Functional CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Case Number',
      'Institution Name',
      'Permanent ID',
      'Bureau',
      'Status',
      'Category',
      'Received Date',
      'Expected Disposal',
      'Assigned Officer'
    ];

    const rows = filteredCases.map((c) => [
      `"${c.case_number}"`,
      `"${c.institution_name_raw.replace(/"/g, '""')}"`,
      `"${c.permanent_id_raw || 'Unresolved'}"`,
      `"${c.bureau_code}"`,
      `"${c.status}"`,
      `"${c.category.replace(/"/g, '""')}"`,
      `"${new Date(c.date_received).toLocaleDateString()}"`,
      `"${c.expected_disposal_date ? new Date(c.expected_disposal_date).toLocaleDateString() : 'N/A'}"`,
      `"${c.assigned_officer_name || 'Unassigned'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TRAC_Cases_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const now = new Date();

  return (
    <div className="space-y-5 animate-fade-in text-neutral-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Institutional Complaints &amp; Cases
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Unified registry across all AICTE Bureaus &amp; Cells · Showing {filteredCases.length} records
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Export filtered records to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <Link
            href="/cases/new"
            className="btn-primary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> File New Complaint
          </Link>
        </div>
      </div>

      {/* Visibility policy notice */}
      <div
        className="p-3.5 rounded-xl text-xs flex items-center justify-between bg-white border border-neutral-200 shadow-2xs"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <span className="text-neutral-600">
            <strong className="text-neutral-900">Cross-Bureau Visibility Policy:</strong>{' '}
            Officials viewing cases owned by other Bureaus receive verified summary views. Full confidential complainant remarks are restricted to the owning Bureau, Senior Officers, and Admin.
          </span>
        </div>
        <span
          className="ml-4 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 flex-shrink-0 uppercase"
        >
          {currentUser.role}
        </span>
      </div>

      {/* Filter and Search Bar (Multi-parameter functional filters) */}
      <div className="p-4 rounded-2xl space-y-3 bg-white border border-neutral-200 shadow-xs">
        {/* Row 1: Search input + Quick Filter Chips */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by case #, institution, permanent ID, category or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mono-input w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 text-neutral-900 focus:border-neutral-900"
            />
          </div>

          {/* Quick filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setQuickFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                quickFilter === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setQuickFilter('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                quickFilter === 'overdue'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Clock className="w-3 h-3" /> Overdue (SLA)
            </button>
            <button
              onClick={() => setQuickFilter('unresolved_id')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                quickFilter === 'unresolved_id'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Unresolved ID
            </button>
          </div>
        </div>

        {/* Row 2: Detailed Filters (Bureau, Region, Category, Status, Date Range) */}
        <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-2">
          {/* Bureau */}
          <select
            value={bureauFilter}
            onChange={(e) => setBureauFilter(e.target.value)}
            className="mono-select px-2.5 py-1.5 text-xs rounded-xl border border-neutral-300 text-neutral-800 bg-white"
            title="Filter by Bureau / Cell"
          >
            <option value="ALL">All Bureaus/Cells</option>
            <option value="RB">Regulation Bureau (RB)</option>
            <option value="PGRC">Public Grievance (PGRC)</option>
            <option value="EB">Extension Bureau (EB)</option>
            <option value="AB">Approval Bureau (AB)</option>
            <option value="QAC">Quality Assurance (QAC)</option>
            <option value="LC">Legal Cell (LC)</option>
          </select>

          {/* Region */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="mono-select px-2.5 py-1.5 text-xs rounded-xl border border-neutral-300 text-neutral-800 bg-white"
            title="Filter by Institution Region"
          >
            <option value="ALL">All Regions</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>{reg} Region</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="mono-select px-2.5 py-1.5 text-xs rounded-xl border border-neutral-300 text-neutral-800 bg-white max-w-[200px] truncate"
            title="Filter by Grievance Category"
          >
            <option value="ALL">All Complaint Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mono-select px-2.5 py-1.5 text-xs rounded-xl border border-neutral-300 text-neutral-800 bg-white"
            title="Filter by Case Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_process">Under Process</option>
            <option value="transferred">Transferred</option>
            <option value="escalated">Escalated</option>
            <option value="disposed">Disposed</option>
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-1.5 text-neutral-600 text-xs">
            <span className="text-[10px] uppercase font-bold text-neutral-400">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mono-input px-2 py-1 text-xs rounded-lg border border-neutral-300 bg-white text-neutral-800"
              title="Filter from received date"
            />
            <span className="text-[10px] uppercase font-bold text-neutral-400">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mono-input px-2 py-1 text-xs rounded-lg border border-neutral-300 bg-white text-neutral-800"
              title="Filter to received date"
            />
          </div>

          {/* Active Filter Count and Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="ml-auto px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left mono-table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Institution &amp; AICTE ID</th>
                <th>Bureau</th>
                <th>Status</th>
                <th>Category</th>
                <th>Received</th>
                <th>SLA Countdown</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.map((c) => {
                let slaBadge = null;
                if (c.status === 'disposed') {
                  slaBadge = <span className="text-[10px] text-neutral-400 font-mono">Completed</span>;
                } else if (c.expected_disposal_date) {
                  const targetDate = new Date(c.expected_disposal_date);
                  const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                  if (diffDays < 0) {
                    slaBadge = (
                      <span className="inline-flex items-center gap-1 font-bold font-mono text-[10px] text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" /> {Math.abs(diffDays)}d overdue
                      </span>
                    );
                  } else if (diffDays <= 7) {
                    slaBadge = (
                      <span className="inline-flex items-center gap-1 font-semibold font-mono text-[10px] text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" /> {diffDays}d left
                      </span>
                    );
                  } else {
                    slaBadge = (
                      <span className="font-mono text-[11px] text-neutral-600">
                        {diffDays}d remaining
                      </span>
                    );
                  }
                } else {
                  slaBadge = <span className="text-[10px] text-neutral-400 font-mono">—</span>;
                }

                return (
                  <tr key={c.id}>
                    <td>
                      <Link
                        href={`/cases/${c.id}`}
                        className="font-mono font-bold text-[11px] text-neutral-900 hover:underline"
                      >
                        {c.case_number}
                      </Link>
                    </td>
                    <td>
                      <div className="font-semibold text-[11px] text-neutral-900 max-w-[200px] truncate">
                        {c.institution_name_raw}
                      </div>
                      <div className="text-[10px] font-mono mt-0.5 flex items-center gap-1.5">
                        {c.permanent_id_raw ? (
                          <span className="text-neutral-500">ID: {c.permanent_id_raw}</span>
                        ) : (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200"
                          >
                            Unresolved ID
                          </span>
                        )}
                        {c.match_method && (
                          <span className="text-[9px] text-neutral-400">
                            [{c.match_method}]
                          </span>
                        )}
                      </div>
                    </td>
                    <td><BureauBadge code={c.bureau_code} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td
                      className="max-w-[140px] truncate text-[11px] text-neutral-600"
                    >
                      {c.category}
                    </td>
                    <td className="font-mono text-[11px] text-neutral-500">
                      {new Date(c.date_received).toLocaleDateString()}
                    </td>
                    <td>
                      {slaBadge}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/cases/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    No cases match the selected search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredCases.length > 0 && (
          <div className="px-6 py-3.5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-600">
            <div>
              Showing <span className="font-semibold text-neutral-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-neutral-900">{Math.min(currentPage * pageSize, filteredCases.length)}</span> of{' '}
              <span className="font-semibold text-neutral-900">{filteredCases.length}</span> cases
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium text-neutral-700"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="px-2 font-mono font-semibold text-neutral-900">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium text-neutral-700"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CasesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Loading cases registry…</div>}>
      <CasesContent />
    </Suspense>
  );
}
