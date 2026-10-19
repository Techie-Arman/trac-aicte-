'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Search, MapPin, ExternalLink, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { dataStore } from '@/lib/store';

export default function InstitutionsPage() {
  const institutions = dataStore.getInstitutions();
  const queueCount = dataStore.getResolutionQueue().length;
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');

  const filtered = institutions.filter((i) => {
    const q = search.toLowerCase();
    const matchesSearch =
      i.name.toLowerCase().includes(q) ||
      i.aicte_permanent_id.toLowerCase().includes(q) ||
      i.district.toLowerCase().includes(q) ||
      i.state.toLowerCase().includes(q);

    const matchesRegion = regionFilter === 'ALL' || i.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-5 animate-fade-in text-neutral-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            AICTE Institution Master Directory
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Official repository of approved institutions indexed by AICTE Permanent ID · Showing {filtered.length} of {institutions.length}
          </p>
        </div>
        <Link
          href="/institutions/queue"
          className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Resolution Queue ({queueCount})
        </Link>
      </div>

      {/* Search & Filter */}
      <div
        className="p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-white border border-neutral-200 shadow-xs"
      >
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search institution name, permanent ID, district, or state…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mono-input w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 text-neutral-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="mono-select px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-800"
          >
            <option value="ALL">All AICTE Regions</option>
            <option value="North">Northern Region</option>
            <option value="West">Western Region</option>
            <option value="South">Southern Region</option>
            <option value="South-Central">South-Central Region</option>
            <option value="East">Eastern Region</option>
          </select>
        </div>
      </div>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inst) => {
          const complaints = dataStore.getComplaintsForInstitution(inst.id);
          const activeCount = complaints.filter((c) => c.status !== 'disposed').length;

          return (
            <div
              key={inst.id}
              className="rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 bg-white border border-neutral-200 shadow-xs hover:shadow-md hover:border-neutral-300"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] mb-3">
                  <span
                    className="font-mono font-bold px-2.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800"
                  >
                    ID: {inst.aicte_permanent_id}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-neutral-500 bg-neutral-50 font-medium"
                  >
                    {inst.region} Region
                  </span>
                </div>

                <h3 className="font-bold text-sm line-clamp-2 mb-2 leading-relaxed text-neutral-900">
                  {inst.name}
                </h3>

                <p className="text-[11px] flex items-start gap-1.5 mb-2 text-neutral-500">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-neutral-400" />
                  {inst.district}, {inst.state}
                </p>

                <p
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-100 text-neutral-600 inline-block"
                >
                  {inst.type}
                </p>
              </div>

              <div
                className="mt-4 pt-3 flex items-center justify-between text-[11px] border-t border-neutral-100"
              >
                <span className="text-neutral-500">
                  {complaints.length} total
                  {activeCount > 0 && (
                    <span className="ml-1.5 font-bold text-neutral-900">
                      ({activeCount} active)
                    </span>
                  )}
                </span>
                <Link
                  href={`/institutions/${inst.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-neutral-900 hover:underline"
                >
                  View Profile <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-xs text-neutral-400 bg-white rounded-2xl border border-neutral-200">
          No institutions match the selected search or filter.
        </div>
      )}
    </div>
  );
}
