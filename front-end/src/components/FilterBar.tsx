import React from 'react';
import { Department, IssueStatus } from '../types';
import { CAMPUS_BUILDINGS } from '../data/mockData';
import { 
  Search, 
  Flame, 
  ArrowUpDown, 
  RotateCcw,
} from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'ALL' | IssueStatus;
  onStatusFilterChange: (status: 'ALL' | IssueStatus) => void;
  departmentFilter: 'ALL' | Department;
  onDepartmentFilterChange: (dept: 'ALL' | Department) => void;
  buildingFilter: 'ALL' | string;
  onBuildingFilterChange: (building: 'ALL' | string) => void;
  highPriorityOnly: boolean;
  onToggleHighPriority: () => void;
  sortBy: 'most_upvoted' | 'newest' | 'oldest';
  onSortByChange: (sort: 'most_upvoted' | 'newest' | 'oldest') => void;
  onResetFilters: () => void;
  counts: {
    total: number;
    reported: number;
    ongoing: number;
    finished: number;
    highPriority: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  buildingFilter,
  onBuildingFilterChange,
  highPriorityOnly,
  onToggleHighPriority,
  sortBy,
  onSortByChange,
  onResetFilters,
  counts,
}) => {
  const departments: Department[] = [
    'Electrical & Lighting',
    'Plumbing & Water Supply',
    'Civil & Infrastructure',
    'Housekeeping & Sanitation',
    'IT & AV Equipment',
    'HVAC & Air Conditioning',
    'Campus Security & Safety'
  ];

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    statusFilter !== 'ALL' || 
    departmentFilter !== 'ALL' || 
    buildingFilter !== 'ALL' || 
    highPriorityOnly;

  return (
    <div id="filter-bar-container" className="bg-white dark:bg-zinc-900 theme-warm:bg-[#fcfbf9] rounded-2xl border border-slate-200 dark:border-zinc-800 theme-warm:border-[#e8e4dc] p-4 shadow-xs mb-6 space-y-3 transition-colors">
      
      {/* Top Search & Priority Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-issues"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ticket ID (e.g. TIET-2026-0842), keyword, or room..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-slate-50 dark:bg-zinc-800/80 theme-warm:bg-[#f5f2eb] border border-slate-200 dark:border-zinc-700/80 theme-warm:border-[#e0dcd4] rounded-xl text-slate-900 dark:text-zinc-100 theme-warm:text-stone-900 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-100"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Priority Toggle */}
        <button
          id="btn-filter-high-priority"
          onClick={onToggleHighPriority}
          className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
            highPriorityOnly
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-xs'
              : 'bg-slate-50 dark:bg-zinc-800 theme-warm:bg-[#f5f2eb] border-slate-200 dark:border-zinc-700 theme-warm:border-[#e0dcd4] text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${highPriorityOnly ? 'text-rose-600 dark:text-rose-400 fill-rose-600' : 'text-slate-400 dark:text-zinc-500'}`} />
          <span>High Priority</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-md text-[10px] bg-white dark:bg-zinc-900 theme-warm:bg-white border border-slate-200 dark:border-zinc-700">
            {counts.highPriority}
          </span>
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-zinc-800 theme-warm:bg-[#f5f2eb] border border-slate-200 dark:border-zinc-700 theme-warm:border-[#e0dcd4] rounded-xl px-3 py-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
          <span className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:inline">Sort:</span>
          <select
            id="select-sort-by"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="bg-transparent text-xs font-medium text-slate-700 dark:text-zinc-300 theme-warm:text-stone-800 focus:outline-hidden cursor-pointer"
          >
            <option value="most_upvoted">Most Upvoted</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Status & Department Selection Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 theme-warm:border-[#e8e4dc]/70">
        
        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="status-filter-all"
            onClick={() => onStatusFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 theme-warm:bg-[#2c2825] theme-warm:text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80'
            }`}
          >
            All ({counts.total})
          </button>

          <button
            id="status-filter-reported"
            onClick={() => onStatusFilterChange('Reported')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'Reported'
                ? 'bg-amber-600 text-white dark:bg-amber-500 shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 hover:bg-amber-100/80'
            }`}
          >
            Reported ({counts.reported})
          </button>

          <button
            id="status-filter-ongoing"
            onClick={() => onStatusFilterChange('Ongoing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'Ongoing'
                ? 'bg-blue-600 text-white dark:bg-blue-500 shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 hover:bg-blue-100/80'
            }`}
          >
            Ongoing ({counts.ongoing})
          </button>

          <button
            id="status-filter-finished"
            onClick={() => onStatusFilterChange('Finished')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'Finished'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 hover:bg-emerald-100/80'
            }`}
          >
            Resolved ({counts.finished})
          </button>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="select-filter-dept"
            value={departmentFilter}
            onChange={(e) => onDepartmentFilterChange(e.target.value as any)}
            className="text-xs font-medium bg-slate-50 dark:bg-zinc-800 theme-warm:bg-[#f5f2eb] border border-slate-200 dark:border-zinc-700 theme-warm:border-[#e0dcd4] rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-zinc-200 theme-warm:text-stone-800 cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            id="select-filter-building"
            value={buildingFilter}
            onChange={(e) => onBuildingFilterChange(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-zinc-800 theme-warm:bg-[#f5f2eb] border border-slate-200 dark:border-zinc-700 theme-warm:border-[#e0dcd4] rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-zinc-200 theme-warm:text-stone-800 cursor-pointer max-w-[180px] truncate"
          >
            <option value="ALL">All Buildings</option>
            {CAMPUS_BUILDINGS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              onClick={onResetFilters}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 rounded-lg"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
