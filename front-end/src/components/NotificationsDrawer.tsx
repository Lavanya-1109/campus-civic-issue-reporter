import React from 'react';
import { NotificationItem, IssueReport } from '../types';
import { 
  X, 
  Bell, 
  Flame, 
  CheckCircle2, 
  ChevronUp, 
  Clock, 
  CheckCheck
} from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectIssueById: (issueId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectIssueById,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 dark:bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-colors">
        
        {/* Drawer Header */}
        <div className="p-4 border-b flex items-center justify-between bg-slate-900 text-white dark:bg-zinc-950 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <Bell className="w-4 h-4 text-slate-300" />
            <h3 className="font-bold text-sm">System Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Action bar */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b flex items-center justify-between text-xs bg-slate-50 border-slate-100 dark:bg-zinc-800/40 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400">Updates across your reports</span>
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center space-x-1 font-semibold text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 text-center">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.issueId) {
                    onSelectIssueById(item.issueId);
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  !item.read
                    ? 'bg-slate-50 border-slate-300 dark:bg-zinc-800/80 dark:border-zinc-700'
                    : 'bg-white border-slate-200/70 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5">
                    {item.type === 'escalation' && <Flame className="w-4 h-4 text-rose-500" />}
                    {item.type === 'status_change' && <Clock className="w-4 h-4 text-blue-500" />}
                    {item.type === 'upvote_milestone' && <ChevronUp className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-zinc-100">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
