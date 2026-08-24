import React from 'react';
import { IssueReport, UserProfile, IssueStatus } from '../types';
import { 
  ChevronUp, 
  MapPin, 
  Clock, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Copy, 
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IssueCardProps {
  issue: IssueReport;
  currentUser: UserProfile;
  onUpvote: (issueId: string) => void;
  onSelect: (issue: IssueReport) => void;
  onChangeStatus?: (issueId: string, newStatus: IssueStatus, note?: string) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  currentUser,
  onUpvote,
  onSelect,
  onChangeStatus,
}) => {
  const [copied, setCopied] = React.useState(false);

  const hasUpvoted = issue.upvotedUserIds.includes(currentUser.id);
  const isReporter = currentUser.role === 'student' || currentUser.role === 'faculty';
  const isAdmin = currentUser.role === 'admin';
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canUpdateStatus = isSuperAdmin || (isAdmin && currentUser.department === issue.department);

  const copyTicket = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(issue.ticketNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasUpvoted && isReporter) {
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#475569', '#64748b', '#0ea5e9']
      });
    }
    onUpvote(issue.id);
  };

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      id={`issue-card-${issue.id}`}
      onClick={() => onSelect(issue)}
      className="group relative bg-white dark:bg-zinc-900 theme-warm:bg-[#fcfbf9] rounded-2xl border border-slate-200/90 dark:border-zinc-800 theme-warm:border-[#e8e4dc] hover:border-slate-400 dark:hover:border-zinc-600 shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      {/* High Priority Bar */}
      {issue.priority === 'High' && (
        <div className="h-1 w-full bg-rose-600 dark:bg-rose-500" />
      )}

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        
        {/* Top Header: Ticket Number, Badges & Status */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            
            {/* Ticket Tag */}
            <button
              onClick={copyTicket}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
              title="Click to copy Ticket ID"
            >
              <span>{issue.ticketNumber}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>

            {/* Department Tag */}
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {issue.department}
            </span>

            {/* High Priority Escalation Badge */}
            {issue.priority === 'High' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                <Flame className="w-3 h-3 text-rose-600 dark:text-rose-400 fill-rose-600" />
                <span>Auto-Escalated</span>
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div>
            {issue.status === 'Reported' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Reported</span>
              </span>
            )}
            {issue.status === 'Ongoing' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Ongoing</span>
              </span>
            )}
            {issue.status === 'Finished' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Resolved</span>
              </span>
            )}
          </div>
        </div>

        {/* Issue Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 theme-warm:text-stone-900 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors line-clamp-2 mb-1.5 leading-snug">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
          {issue.description}
        </p>

        {/* Location Structure */}
        <div className="bg-slate-50 dark:bg-zinc-800/50 theme-warm:bg-[#f5f2eb] rounded-xl p-2.5 border border-slate-100 dark:border-zinc-800 mb-3 text-xs text-slate-700 dark:text-zinc-300 space-y-0.5">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-900 dark:text-zinc-200">
            <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 flex-shrink-0" />
            <span className="truncate">{issue.location.building}</span>
          </div>
          <div className="flex items-center space-x-1.5 pl-5 text-[11px] text-slate-500 dark:text-zinc-400">
            <span>{issue.location.floor}</span>
            <span>•</span>
            <span className="truncate font-medium text-slate-700 dark:text-zinc-300">{issue.location.roomArea}</span>
          </div>
        </div>

        {/* Image thumbnail if present */}
        {issue.imageUrl && (
          <div className="mb-3 rounded-xl overflow-hidden max-h-32 bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800 relative">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-32 object-cover"
              loading="lazy"
            />
          </div>
        )}

      </div>

      {/* Card Footer */}
      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-zinc-800/40 theme-warm:bg-[#f7f5f0] border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
        
        {/* Upvote Button */}
        <button
          id={`btn-upvote-${issue.id}`}
          onClick={handleUpvoteClick}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            hasUpvoted
              ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
              : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
          }`}
          title={hasUpvoted ? 'You have upvoted this issue' : 'Upvote this issue'}
        >
          <ChevronUp className="w-3.5 h-3.5" />
          <span>{issue.upvotes}</span>
          <span className="text-[11px] font-normal opacity-80 hidden sm:inline">
            {hasUpvoted ? 'Upvoted' : 'Upvote'}
          </span>
        </button>

        {/* Reporter info */}
        <div className="text-[11px] text-slate-500 dark:text-zinc-400 text-right flex-1 truncate">
          <span>{issue.reportedBy.name}</span>
          <span className="block text-[10px] text-slate-400 dark:text-zinc-500">{formattedDate}</span>
        </div>

        {/* Inline admin status */}
        {canUpdateStatus && onChangeStatus && (
          <div onClick={(e) => e.stopPropagation()}>
            <select
              value={issue.status}
              onChange={(e) => onChangeStatus(issue.id, e.target.value as IssueStatus)}
              className="text-xs font-semibold bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-slate-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
            >
              <option value="Reported">Reported</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Finished">Finished</option>
            </select>
          </div>
        )}

        <button
          id={`btn-view-details-${issue.id}`}
          onClick={() => onSelect(issue)}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          title="View detailed timeline and history"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
