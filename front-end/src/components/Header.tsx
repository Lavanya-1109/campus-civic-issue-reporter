import React from 'react';
import { UserProfile, Role, Department } from '../types';
import { useTheme, ThemeMode } from '../theme';
import { 
  Building2, 
  Bell, 
  Plus, 
  BarChart3, 
  Sliders, 
  Layers,
  Sun,
  Moon,
  Sparkles,
  Palette
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onOpenReportModal: () => void;
  onOpenAnalytics: () => void;
  onOpenEscalationConfig: () => void;
  unreadNotificationCount: number;
  onToggleNotifications: () => void;
  activeView: 'feed' | 'my_reports' | 'analytics';
  onChangeView: (view: 'feed' | 'my_reports' | 'analytics') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenReportModal,
  onOpenAnalytics,
  onOpenEscalationConfig,
  unreadNotificationCount,
  onToggleNotifications,
  activeView,
  onChangeView,
}) => {
  const { theme, setTheme } = useTheme();
  const isReporter = currentUser.role === 'student' || currentUser.role === 'faculty';
  const isSuperAdmin = currentUser.role === 'super_admin';

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 theme-warm:bg-[#fcfbf9]/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 theme-warm:border-[#e8e4dc] transition-colors">
      {/* Institutional Topline */}
      <div className="bg-slate-900 text-slate-300 dark:bg-zinc-950 dark:text-zinc-400 theme-warm:bg-[#23201d] theme-warm:text-stone-300 text-[11px] px-4 py-1">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="tracking-wide">Thapar Institute of Engineering & Technology (TIET)</span>
            <span className="opacity-40 hidden sm:inline">|</span>
            <span className="hidden sm:inline opacity-80">Infrastructure Issue Governance Portal (UCS503P)</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="opacity-80">Live Campus Sandbox</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          
          {/* Platform Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onChangeView('feed')}>
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 theme-warm:bg-[#342f2c] theme-warm:text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 theme-warm:text-stone-900 tracking-tight">
                  Civic Issue Reporter
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-zinc-800/60 theme-warm:bg-[#f2efe9] p-1 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 theme-warm:border-[#e0dcd4]">
            <button
              id="nav-tab-all-issues"
              onClick={() => onChangeView('feed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'feed'
                  ? 'bg-white dark:bg-zinc-900 theme-warm:bg-white text-slate-900 dark:text-zinc-100 theme-warm:text-stone-900 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 theme-warm:text-stone-600 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Campus Incidents
            </button>

            {isReporter && (
              <button
                id="nav-tab-my-issues"
                onClick={() => onChangeView('my_reports')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'my_reports'
                    ? 'bg-white dark:bg-zinc-900 theme-warm:bg-white text-slate-900 dark:text-zinc-100 theme-warm:text-stone-900 shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 theme-warm:text-stone-600 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                My Submissions
              </button>
            )}

            <button
              id="nav-tab-analytics"
              onClick={() => onChangeView('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeView === 'analytics'
                  ? 'bg-white dark:bg-zinc-900 theme-warm:bg-white text-slate-900 dark:text-zinc-100 theme-warm:text-stone-900 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 theme-warm:text-stone-600 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Pilot Analytics</span>
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center space-x-2">
            
            {/* Theme Selector Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 theme-warm:bg-[#f0ece4] p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700/60 theme-warm:border-[#ded9cf]">
              <button
                id="btn-theme-slate"
                onClick={() => setTheme('slate')}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                  theme === 'slate'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                }`}
                title="Light Slate Theme"
              >
                Slate
              </button>
              <button
                id="btn-theme-warm"
                onClick={() => setTheme('warm')}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                  theme === 'warm'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Warm Paper Theme"
              >
                Warm
              </button>
              <button
                id="btn-theme-dark"
                onClick={() => setTheme('dark')}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-zinc-100 shadow-2xs font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Dark Obsidian Theme"
              >
                Dark
              </button>
            </div>

            {/* Super Admin Escalation Rules */}
            {isSuperAdmin && (
              <button
                id="btn-escalation-rules"
                onClick={onOpenEscalationConfig}
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                title="Configure auto-escalation thresholds"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Rules</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              id="btn-notifications-toggle"
              onClick={onToggleNotifications}
              className="relative p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Report New Issue Button */}
            <button
              id="btn-report-issue-header"
              onClick={onOpenReportModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white theme-warm:bg-[#2c2825] theme-warm:hover:bg-[#1c1917] text-xs font-semibold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>

            {/* Role Switcher */}
            <div className="pl-1 border-l border-slate-200 dark:border-zinc-800 theme-warm:border-[#e8e4dc]">
              <select
                id="select-user-role"
                value={currentUser.id}
                onChange={(e) => {
                  const selected = allUsers.find(u => u.id === e.target.value);
                  if (selected) onSwitchUser(selected);
                }}
                className="text-xs font-medium bg-slate-50 dark:bg-zinc-800 theme-warm:bg-[#f5f2eb] border border-slate-200 dark:border-zinc-700 theme-warm:border-[#e0dcd4] rounded-lg px-2 py-1 text-slate-800 dark:text-zinc-200 theme-warm:text-stone-900 hover:bg-slate-100 cursor-pointer focus:outline-hidden"
              >
                <optgroup label="Reporters">
                  <option value="user-student-1">Nadeem Esrar (Student - COE)</option>
                  <option value="user-student-2">Lavanya Sharma (Student - COE)</option>
                  <option value="user-faculty-1">Dr. Parismita Thapa (Faculty)</option>
                </optgroup>
                <optgroup label="Department Admins">
                  <option value="user-admin-elec">Rajesh Verma (Electrical)</option>
                  <option value="user-admin-plumb">Suresh Sharma (Plumbing)</option>
                </optgroup>
                <optgroup label="Super Admin">
                  <option value="user-super-admin">Dean Facilities (Super-Admin)</option>
                </optgroup>
              </select>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
