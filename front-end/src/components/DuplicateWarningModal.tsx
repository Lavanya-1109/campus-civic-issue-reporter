import React from 'react';
import { DuplicateCandidateMatch, IssueReport } from '../types';
import { 
  AlertTriangle, 
  ChevronUp, 
  ArrowRight, 
  X, 
  MapPin, 
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  duplicateCandidate: DuplicateCandidateMatch | null;
  pendingIssue: any;
  onClose: () => void;
  onUpvoteExisting: (existingIssueId: string) => void;
  onForceSubmit: () => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  duplicateCandidate,
  pendingIssue,
  onClose,
  onUpvoteExisting,
  onForceSubmit,
}) => {
  if (!isOpen || !duplicateCandidate || !pendingIssue) return null;

  const existing = duplicateCandidate.existingIssue;
  const similarityPercent = Math.round(duplicateCandidate.similarityScore * 100);

  const handleUpvoteAndDeflect = () => {
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0f172a', '#2563eb', '#10b981']
    });
    onUpvoteExisting(existing.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="rounded-2xl shadow-xl border max-w-2xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 transition-colors">
        
        {/* Banner Header */}
        <div className="p-4 sm:p-5 flex items-start justify-between border-b bg-amber-500/10 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Similar Issue Already Active</h2>
              <p className="text-xs text-amber-800/80 dark:text-amber-400">
                Match score: <strong className="font-mono">{similarityPercent}%</strong> similarity detected in same location
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-800/60 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Comparison Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
            A reported ticket matches your location and problem description. To prevent duplicate administrative work and help resolve this faster, we recommend <strong className="text-slate-900 dark:text-zinc-100">upvoting the existing ticket</strong> to boost its escalation priority.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* Existing Active Ticket */}
            <div className="rounded-xl border p-3.5 space-y-2 bg-slate-50 border-slate-200 dark:bg-zinc-800/50 dark:border-zinc-700/80">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Active Ticket</span>
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
                  {existing.ticketNumber}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-zinc-100 line-clamp-2">
                {existing.title}
              </h4>

              <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                {existing.description}
              </p>

              <div className="text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200/60 dark:border-zinc-700/60 space-y-0.5">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{existing.location.building} • {existing.location.roomArea}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span>Status: <strong>{existing.status}</strong></span>
                  <span>Upvotes: <strong>{existing.upvotes}</strong></span>
                </div>
              </div>
            </div>

            {/* Pending Submission */}
            <div className="rounded-xl border p-3.5 space-y-2 bg-white border-slate-200 dark:bg-zinc-800/30 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-zinc-400">
                  Your New Draft
                </span>
                <span className="text-[10px] text-slate-400">
                  Not submitted yet
                </span>
              </div>

              <h4 className="font-bold text-slate-800 dark:text-zinc-200 line-clamp-2">
                {pendingIssue.title}
              </h4>

              <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                {pendingIssue.description}
              </p>

              <div className="text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800 space-y-0.5">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{pendingIssue.location.building} • {pendingIssue.location.roomArea}</span>
                </div>
                <div className="text-[10px] pt-1 text-slate-400">
                  Category: {pendingIssue.category}
                </div>
              </div>
            </div>

          </div>

          {/* Action Recommendation */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            <button
              onClick={onForceSubmit}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-left py-1"
            >
              Submit as a distinct issue anyway →
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border font-semibold text-slate-600 hover:bg-slate-100 border-slate-200 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:border-zinc-700"
              >
                Back to Edit
              </button>
              <button
                onClick={handleUpvoteAndDeflect}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-all shadow-xs"
              >
                <ChevronUp className="w-4 h-4" />
                <span>Upvote Existing Ticket ({existing.upvotes})</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
