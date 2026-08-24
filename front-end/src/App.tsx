import React, { useState, useEffect } from 'react';
import { 
  IssueReport, 
  UserProfile, 
  NotificationItem, 
  EscalationConfig, 
  IssueStatus, 
  Department, 
  DuplicateCandidateMatch 
} from './types';
import { 
  SAMPLE_ISSUES, 
  SAMPLE_USERS, 
  INITIAL_NOTIFICATIONS, 
  DEFAULT_ESCALATION_CONFIG 
} from './data/mockData';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { IssueCard } from './components/IssueCard';
import { ReportIssueModal } from './components/ReportIssueModal';
import { IssueDetailModal } from './components/IssueDetailModal';
import { DuplicateWarningModal } from './components/DuplicateWarningModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { EscalationRulesModal } from './components/EscalationRulesModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ThemeProvider } from './theme';
import { 
  Inbox
} from 'lucide-react';

export function AppContent() {
  // Persistence state
  const [issues, setIssues] = useState<IssueReport[]>(() => {
    const saved = localStorage.getItem('civic_issues_v2');
    return saved ? JSON.parse(saved) : SAMPLE_ISSUES;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('civic_current_user_v2');
    return saved ? JSON.parse(saved) : SAMPLE_USERS[0];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('civic_notifications_v2');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [escalationConfig, setEscalationConfig] = useState<EscalationConfig>(() => {
    const saved = localStorage.getItem('civic_escalation_config_v2');
    return saved ? JSON.parse(saved) : DEFAULT_ESCALATION_CONFIG;
  });

  // Views & Modals state
  const [activeView, setActiveView] = useState<'feed' | 'my_reports' | 'analytics'>('feed');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);

  // Duplicate Warning state
  const [duplicateCandidate, setDuplicateCandidate] = useState<DuplicateCandidateMatch | null>(null);
  const [pendingDraft, setPendingDraft] = useState<any | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | IssueStatus>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<'ALL' | Department>('ALL');
  const [buildingFilter, setBuildingFilter] = useState<'ALL' | string>('ALL');
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'most_upvoted' | 'newest' | 'oldest'>('most_upvoted');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('civic_issues_v2', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('civic_current_user_v2', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('civic_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('civic_escalation_config_v2', JSON.stringify(escalationConfig));
  }, [escalationConfig]);

  // Upvote Issue Logic
  const handleUpvote = (issueId: string) => {
    setIssues(prevIssues => {
      return prevIssues.map(issue => {
        if (issue.id !== issueId) return issue;

        const hasAlreadyUpvoted = issue.upvotedUserIds.includes(currentUser.id);
        const newUpvotedIds = hasAlreadyUpvoted
          ? issue.upvotedUserIds.filter(id => id !== currentUser.id)
          : [...issue.upvotedUserIds, currentUser.id];
        
        const newUpvotes = newUpvotedIds.length;

        // Check if threshold reached
        const threshold = escalationConfig.categoryThresholds[issue.category] ?? escalationConfig.defaultUpvoteThreshold;
        const shouldEscalate = newUpvotes >= threshold && issue.priority !== 'High';

        const updatedPriority = shouldEscalate ? ('High' as const) : issue.priority;
        const isEscalatedNow = shouldEscalate || issue.isEscalated;

        let updatedTimeline = issue.timeline;
        if (shouldEscalate) {
          updatedTimeline = [
            ...issue.timeline,
            {
              id: `evt-esc-${Date.now()}`,
              timestamp: new Date().toISOString(),
              status: issue.status,
              updatedBy: 'System Governance Policy',
              userRole: 'super_admin',
              note: `Auto-escalated to High Priority upon reaching ${newUpvotes} verified campus upvotes (Threshold: ${threshold}).`
            }
          ];

          // Trigger notification
          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            userId: currentUser.id,
            title: `Issue Auto-Escalated: ${issue.ticketNumber}`,
            message: `"${issue.title}" reached ${newUpvotes} upvotes and has been flagged High Priority to Dean Estate.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'escalation',
            issueId: issue.id,
            ticketNumber: issue.ticketNumber
          };
          setNotifications(prev => [newNotif, ...prev]);
        }

        const updatedIssue: IssueReport = {
          ...issue,
          upvotes: newUpvotes,
          upvotedUserIds: newUpvotedIds,
          priority: updatedPriority,
          isEscalated: isEscalatedNow,
          timeline: updatedTimeline,
          updatedAt: new Date().toISOString()
        };

        // If selected issue is currently viewed in modal, update it
        if (selectedIssue && selectedIssue.id === issue.id) {
          setSelectedIssue(updatedIssue);
        }

        return updatedIssue;
      });
    });
  };

  // Submit Brand New Issue
  const handleSubmitNewIssue = (newIssueData: Omit<IssueReport, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'upvotes' | 'upvotedUserIds' | 'timeline' | 'commentsCount' | 'isEscalated'>) => {
    const newId = `issue-${Date.now()}`;
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TIET-2026-${randNum}`;
    const nowIso = new Date().toISOString();

    const createdIssue: IssueReport = {
      ...newIssueData,
      id: newId,
      ticketNumber,
      createdAt: nowIso,
      updatedAt: nowIso,
      upvotes: 1,
      upvotedUserIds: [currentUser.id],
      commentsCount: 0,
      isEscalated: newIssueData.priority === 'High',
      timeline: [
        {
          id: `evt-${Date.now()}`,
          timestamp: nowIso,
          status: 'Reported',
          updatedBy: currentUser.name,
          userRole: currentUser.role,
          note: `Incident registered with ticket ${ticketNumber} and routed to ${newIssueData.department}.`
        }
      ]
    };

    setIssues(prev => [createdIssue, ...prev]);

    // Send notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: `New Ticket Created: ${ticketNumber}`,
      message: `Your report "${createdIssue.title}" has been lodged with ${createdIssue.department}.`,
      timestamp: nowIso,
      read: false,
      type: 'status_change',
      issueId: createdIssue.id,
      ticketNumber: createdIssue.ticketNumber
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Admin Update Status
  const handleUpdateStatus = (
    issueId: string, 
    newStatus: IssueStatus, 
    note: string, 
    assignedTech?: string
  ) => {
    setIssues(prevIssues => {
      return prevIssues.map(issue => {
        if (issue.id !== issueId) return issue;

        const nowIso = new Date().toISOString();
        const updatedTimeline = [
          ...issue.timeline,
          {
            id: `evt-${Date.now()}`,
            timestamp: nowIso,
            status: newStatus,
            updatedBy: currentUser.name,
            userRole: currentUser.role,
            note: note || `Status transitioned to ${newStatus}`
          }
        ];

        const updated: IssueReport = {
          ...issue,
          status: newStatus,
          assignedAdminName: assignedTech || issue.assignedAdminName,
          timeline: updatedTimeline,
          updatedAt: nowIso
        };

        if (selectedIssue && selectedIssue.id === issue.id) {
          setSelectedIssue(updated);
        }

        // Send notification
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          userId: issue.reportedBy.id,
          title: `Status Updated: ${issue.ticketNumber}`,
          message: `Ticket "${issue.title}" marked as ${newStatus} by ${currentUser.name}.`,
          timestamp: nowIso,
          read: false,
          type: 'status_change',
          issueId: issue.id,
          ticketNumber: issue.ticketNumber
        };
        setNotifications(prev => [newNotif, ...prev]);

        return updated;
      });
    });
  };

  // Duplicate Warning triggers
  const handleTriggerDuplicateFound = (candidate: DuplicateCandidateMatch, pendingReport: any) => {
    setDuplicateCandidate(candidate);
    setPendingDraft(pendingReport);
  };

  const handleForceSubmitPendingDraft = () => {
    if (pendingDraft) {
      handleSubmitNewIssue(pendingDraft);
      setPendingDraft(null);
      setDuplicateCandidate(null);
    }
  };

  // Filter and Sort Logic
  const filteredIssues = issues.filter(issue => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchTicket = issue.ticketNumber.toLowerCase().includes(q);
      const matchBuilding = issue.location.building.toLowerCase().includes(q);
      const matchRoom = issue.location.roomArea.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTicket && !matchBuilding && !matchRoom) {
        return false;
      }
    }

    // Status
    if (statusFilter !== 'ALL' && issue.status !== statusFilter) return false;

    // Department
    if (departmentFilter !== 'ALL' && issue.department !== departmentFilter) return false;

    // Building
    if (buildingFilter !== 'ALL' && issue.location.building !== buildingFilter) return false;

    // High Priority
    if (highPriorityOnly && issue.priority !== 'High') return false;

    // My Reports view
    if (activeView === 'my_reports' && issue.reportedBy.id !== currentUser.id) return false;

    return true;
  });

  // Sort
  filteredIssues.sort((a, b) => {
    if (sortBy === 'most_upvoted') return b.upvotes - a.upvotes;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return 0;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const counts = {
    total: issues.length,
    reported: issues.filter(i => i.status === 'Reported').length,
    ongoing: issues.filter(i => i.status === 'Ongoing').length,
    finished: issues.filter(i => i.status === 'Finished').length,
    highPriority: issues.filter(i => i.priority === 'High').length,
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-slate-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900 transition-colors duration-200">
      
      {/* Header */}
      <Header
        currentUser={currentUser}
        allUsers={SAMPLE_USERS}
        onSwitchUser={setCurrentUser}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenEscalationConfig={() => setIsEscalationModalOpen(true)}
        unreadNotificationCount={unreadCount}
        onToggleNotifications={() => setIsNotificationsOpen(true)}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeView === 'analytics' ? (
          <AnalyticsDashboard issues={issues} />
        ) : (
          <div>
            {/* View Sub-Header for My Reports */}
            {activeView === 'my_reports' && (
              <div className="mb-4 p-4 rounded-2xl border flex items-center justify-between bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    My Lodged Issues ({filteredIssues.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Track resolution progress and supervisor notes for incidents you reported
                  </p>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 cursor-pointer"
                >
                  + Report Another
                </button>
              </div>
            )}

            {/* Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              departmentFilter={departmentFilter}
              onDepartmentFilterChange={setDepartmentFilter}
              buildingFilter={buildingFilter}
              onBuildingFilterChange={setBuildingFilter}
              highPriorityOnly={highPriorityOnly}
              onToggleHighPriority={() => setHighPriorityOnly(!highPriorityOnly)}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onResetFilters={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setDepartmentFilter('ALL');
                setBuildingFilter('ALL');
                setHighPriorityOnly(false);
                setSortBy('most_upvoted');
              }}
              counts={counts}
            />

            {/* Feed Cards Grid */}
            {filteredIssues.length === 0 ? (
              <div className="rounded-2xl border p-12 text-center my-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <Inbox className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600 mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">
                  No issues found matching your criteria
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query, status filters, or building selection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {filteredIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    currentUser={currentUser}
                    onUpvote={handleUpvote}
                    onSelect={setSelectedIssue}
                    onChangeStatus={(id, st) => handleUpdateStatus(id, st, `Status updated to ${st}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modals & Drawers */}
      <ReportIssueModal
        currentUser={currentUser}
        existingIssues={issues}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitNewIssue={handleSubmitNewIssue}
        onTriggerDuplicateFound={handleTriggerDuplicateFound}
      />

      <DuplicateWarningModal
        isOpen={duplicateCandidate !== null}
        duplicateCandidate={duplicateCandidate}
        pendingIssue={pendingDraft}
        onClose={() => {
          setDuplicateCandidate(null);
          setPendingDraft(null);
        }}
        onUpvoteExisting={(id) => {
          handleUpvote(id);
          setDuplicateCandidate(null);
          setPendingDraft(null);
        }}
        onForceSubmit={handleForceSubmitPendingDraft}
      />

      <IssueDetailModal
        issue={selectedIssue}
        currentUser={currentUser}
        isOpen={selectedIssue !== null}
        onClose={() => setSelectedIssue(null)}
        onUpvote={handleUpvote}
        onUpdateStatus={handleUpdateStatus}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }}
        onSelectIssueById={(issueId) => {
          const found = issues.find(i => i.id === issueId);
          if (found) setSelectedIssue(found);
        }}
      />

      <EscalationRulesModal
        isOpen={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
        config={escalationConfig}
        onSaveConfig={setEscalationConfig}
      />

      {/* Academic Footer */}
      <footer className="border-t mt-12 py-6 text-xs transition-colors bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Civic Issue Reporter</span>
            <span>•</span>
            <span>Thapar Institute of Engineering & Technology</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Clean Light / Warm / Dark Mode</span>
            <span>•</span>
            <span className="font-mono text-slate-400">Version 2.0.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
