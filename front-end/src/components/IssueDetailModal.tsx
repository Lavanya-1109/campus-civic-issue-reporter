import React, { useState } from 'react';
import { IssueReport, UserProfile, IssueStatus } from '../types';
import { 
  X, 
  MapPin, 
  Clock, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  ChevronUp, 
  Copy, 
  Check, 
  Send, 
  Wrench,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IssueDetailModalProps {
  issue: IssueReport | null;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpvote: (issueId: string) => void;
  onUpdateStatus: (
    issueId: string, 
    newStatus: IssueStatus, 
    note: string, 
    assignedTech?: string
  ) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  currentUser,
  isOpen,
  onClose,
  onUpvote,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [newStatus, setNewStatus] = useState<IssueStatus>('Ongoing');
  const [adminNote, setAdminNote] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);

  if (!isOpen || !issue) return null;

  const hasUpvoted = issue.upvotedUserIds.includes(currentUser.id);
  const isReporter = currentUser.role === 'student' || currentUser.role === 'faculty';
  const isAdmin = currentUser.role === 'admin';
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canManageStatus = isSuperAdmin || (isAdmin && currentUser.department === issue.department);

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(issue.ticketNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpvoteClick = () => {
    if (!hasUpvoted && isReporter) {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#0f172a', '#2563eb', '#10b981']
      });
    }
    onUpvote(issue.id);
  };

  const handleAdminStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNote.trim()) return;

    onUpdateStatus(
      issue.id, 
      newStatus, 
      adminNote.trim(), 
      technicianName.trim() || undefined
    );
    setAdminNote('');
    setTechnicianName('');
    setShowAdminForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="rounded-2xl shadow-xl border max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-start justify-between border-b bg-slate-900 text-white dark:bg-zinc-950 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={handleCopyTicket}
                className="font-mono text-xs font-medium px-2 py-0.5 rounded-md border flex items-center space-x-1 transition-colors bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                title="Click to copy ticket code"
              >
                <span>{issue.ticketNumber}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>

              <span className="text-xs px-2 py-0.5 rounded-md border bg-slate-800 border-slate-700 text-slate-300">
                {issue.department}
              </span>

              {issue.priority === 'High' && (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-800 text-rose-300">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>High Priority</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white pt-1">
              {issue.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Lifecycle Step Indicators */}
          <div className="rounded-xl border p-3.5 bg-slate-50 border-slate-200/80 dark:bg-zinc-800/40 dark:border-zinc-800">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 dark:text-zinc-400 mb-2 block">
              Resolution Lifecycle
            </span>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`p-2 rounded-lg border transition-all ${
                issue.status === 'Reported'
                  ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
              }`}>
                <div className="flex items-center justify-center space-x-1 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>1. Reported</span>
                </div>
              </div>

              <div className={`p-2 rounded-lg border transition-all ${
                issue.status === 'Ongoing'
                  ? 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300 font-bold'
                  : issue.status === 'Finished'
                  ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300'
                  : 'bg-white border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500'
              }`}>
                <div className="flex items-center justify-center space-x-1 text-xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>2. Ongoing</span>
                </div>
              </div>

              <div className={`p-2 rounded-lg border transition-all ${
                issue.status === 'Finished'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 font-bold'
                  : 'bg-white border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500'
              }`}>
                <div className="flex items-center justify-center space-x-1 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>3. Resolved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Main Info */}
            <div className="md:col-span-2 space-y-3.5">
              
              <div>
                <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Description
                </span>
                <p className="p-3 rounded-xl border leading-relaxed bg-slate-50 border-slate-200/80 text-slate-800 dark:bg-zinc-800/40 dark:border-zinc-800 dark:text-zinc-200">
                  {issue.description}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Location Details
                </span>
                <div className="rounded-xl p-3 border space-y-1 bg-slate-50 border-slate-200/80 text-slate-700 dark:bg-zinc-800/40 dark:border-zinc-800 dark:text-zinc-300">
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60 dark:border-zinc-700/60">
                    <span className="text-slate-500 dark:text-zinc-400">Building:</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{issue.location.building}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60 dark:border-zinc-700/60">
                    <span className="text-slate-500 dark:text-zinc-400">Floor:</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{issue.location.floor}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60 dark:border-zinc-700/60">
                    <span className="text-slate-500 dark:text-zinc-400">Room / Area:</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{issue.location.roomArea}</span>
                  </div>
                  {issue.location.landmarkDetails && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500 dark:text-zinc-400">Landmark:</span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{issue.location.landmarkDetails}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo */}
              {issue.imageUrl && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Photo Attachment
                  </span>
                  <div className="rounded-xl overflow-hidden border max-h-56 bg-slate-100 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700">
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar Column */}
            <div className="space-y-3.5">
              
              {/* Upvote Box */}
              <div className="rounded-xl border p-3.5 text-center bg-slate-50 border-slate-200/80 dark:bg-zinc-800/40 dark:border-zinc-800">
                <span className="font-semibold text-slate-600 dark:text-zinc-400 block text-[11px]">Community Upvotes</span>
                <span className="text-2xl font-bold my-0.5 block text-slate-900 dark:text-zinc-100">
                  {issue.upvotes}
                </span>
                <button
                  id="btn-detail-upvote"
                  onClick={handleUpvoteClick}
                  className={`w-full mt-2 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    hasUpvoted
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>{hasUpvoted ? 'Upvoted' : 'Upvote Issue'}</span>
                </button>
              </div>

              {/* Reporter Box */}
              <div className="rounded-xl border p-3 space-y-1.5 bg-slate-50 border-slate-200/80 dark:bg-zinc-800/40 dark:border-zinc-800">
                <span className="font-semibold text-slate-500 dark:text-zinc-400 text-[10px] uppercase block">
                  Reported By
                </span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                  {issue.reportedBy.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block capitalize">
                  {issue.reportedBy.role} {issue.reportedBy.rollNumber ? `• ${issue.reportedBy.rollNumber}` : ''}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                  {new Date(issue.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Assigned Staff */}
              {issue.assignedAdminName && (
                <div className="rounded-xl border p-3 bg-blue-50/50 border-blue-200/80 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-300">
                  <span className="font-semibold block mb-0.5 text-[11px]">
                    Assigned Lead
                  </span>
                  <p className="font-bold">{issue.assignedAdminName}</p>
                </div>
              )}

            </div>

          </div>

          {/* Timeline */}
          <div>
            <span className="font-semibold text-slate-700 dark:text-zinc-300 block mb-2">
              Activity & Resolution Timeline
            </span>

            <div className="rounded-xl border p-3.5 space-y-3 bg-slate-50 border-slate-200/80 dark:bg-zinc-800/40 dark:border-zinc-800">
              {issue.timeline.map((event, index) => (
                <div key={event.id || index} className="flex items-start space-x-2.5">
                  <div className="mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      event.status === 'Reported' ? 'bg-amber-500' :
                      event.status === 'Ongoing' ? 'bg-blue-500' :
                      'bg-emerald-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                      <span className="font-medium text-slate-800 dark:text-zinc-200">{event.updatedBy} ({event.userRole})</span>
                      <span>{new Date(event.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-300 mt-0.5">
                      {event.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Admin Action Panel */}
          {canManageStatus && (
            <div className="rounded-xl border p-4 space-y-3 bg-slate-900 text-white dark:bg-zinc-950 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-semibold text-slate-200">
                    Administrator Actions ({currentUser.role.replace('_', ' ')})
                  </span>
                </div>
                {!showAdminForm && (
                  <button
                    onClick={() => setShowAdminForm(true)}
                    className="px-3 py-1 rounded-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Update Status
                  </button>
                )}
              </div>

              {showAdminForm && (
                <form onSubmit={handleAdminStatusSubmit} className="pt-2 space-y-3 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">
                        New Status:
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                        className="w-full px-2.5 py-1.5 rounded-lg border bg-slate-800 border-slate-700 text-white cursor-pointer"
                      >
                        <option value="Reported">1. Reported</option>
                        <option value="Ongoing">2. Ongoing (In Progress)</option>
                        <option value="Finished">3. Finished (Resolved)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">
                        Assigned Lead / Staff:
                      </label>
                      <input
                        type="text"
                        value={technicianName}
                        onChange={(e) => setTechnicianName(e.target.value)}
                        placeholder="e.g. Ramesh (Sr. Electrician)"
                        className="w-full px-2.5 py-1.5 rounded-lg border bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      Resolution Remarks <span className="text-rose-400">*</span>:
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="e.g. Replaced faulty socket and verified safe operation."
                      className="w-full px-2.5 py-1.5 rounded-lg border bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAdminForm(false)}
                      className="px-3 py-1 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 rounded-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Save Status Update</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t flex items-center justify-between bg-slate-50 border-slate-200 dark:bg-zinc-950 dark:border-zinc-800">
          <span className="text-[10px] text-slate-500 dark:text-zinc-500">
            Updated: {new Date(issue.updatedAt).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg font-semibold border transition-colors bg-white border-slate-300 text-slate-700 hover:bg-slate-100 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
