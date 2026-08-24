import React, { useState } from 'react';
import { EscalationConfig, Category } from '../types';
import { 
  X, 
  Sliders, 
  Flame, 
  Clock, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';

interface EscalationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EscalationConfig;
  onSaveConfig: (newConfig: EscalationConfig) => void;
}

export const EscalationRulesModal: React.FC<EscalationRulesModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = useState<EscalationConfig>(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const categories: Category[] = [
    'Electrical & Wiring',
    'Plumbing Leak / Water Issue',
    'Broken Furniture / Structural',
    'Washroom & Cleanliness',
    'Projector / Audio / Lab Equipment',
    'AC / Ventilation Malfunction',
    'Unsafe Walkway / Lighting Hazard',
    'Other Infrastructure'
  ];

  const handleThresholdChange = (cat: Category, val: number) => {
    setLocalConfig(prev => ({
      ...prev,
      categoryThresholds: {
        ...prev.categoryThresholds,
        [cat]: Math.max(1, val)
      }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(localConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleResetDefaults = () => {
    setLocalConfig({
      defaultUpvoteThreshold: 8,
      safetyCriticalThreshold: 4,
      autoEscalateHours: 48,
      categoryThresholds: {
        'Electrical & Wiring': 3,
        'Plumbing Leak / Water Issue': 5,
        'Broken Furniture / Structural': 8,
        'Washroom & Cleanliness': 5,
        'Projector / Audio / Lab Equipment': 4,
        'AC / Ventilation Malfunction': 6,
        'Unsafe Walkway / Lighting Hazard': 3,
        'Other Infrastructure': 5
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="rounded-2xl shadow-xl border max-w-2xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b bg-slate-900 text-white dark:bg-zinc-950 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-200 dark:bg-zinc-800">
              <Sliders className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Escalation Policy Engine</h2>
              <p className="text-xs text-slate-400">
                Super-Admin per-category threshold and auto-escalation controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {savedSuccess && (
            <div className="p-3 rounded-xl border flex items-center space-x-2 bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Escalation rules updated and active across campus system.</span>
            </div>
          )}

          {/* Global Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border bg-slate-50 border-slate-200 dark:bg-zinc-800/50 dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-800 dark:text-zinc-200">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Safety-Critical Default</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Upvotes required for electrical/hazard items to auto-escalate to High Priority.
              </p>
              <input
                type="number"
                min="1"
                max="50"
                value={localConfig.safetyCriticalThreshold}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, safetyCriticalThreshold: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-1.5 rounded-lg border bg-white border-slate-300 text-slate-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>

            <div className="p-3 rounded-xl border bg-slate-50 border-slate-200 dark:bg-zinc-800/50 dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-800 dark:text-zinc-200">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Auto-Escalate SLA (Hours)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Unaddressed tickets older than this duration auto-flag to Dean Estate.
              </p>
              <input
                type="number"
                min="6"
                max="168"
                value={localConfig.autoEscalateHours}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, autoEscalateHours: parseInt(e.target.value) || 24 }))}
                className="w-full px-3 py-1.5 rounded-lg border bg-white border-slate-300 text-slate-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Per-Category Specific Thresholds */}
          <div className="rounded-xl border p-4 space-y-3 bg-slate-50/80 border-slate-200/80 dark:bg-zinc-800/40 dark:border-zinc-800">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
              Per-Category Upvote Escalation Thresholds
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center justify-between p-2 rounded-lg border bg-white border-slate-200 dark:bg-zinc-800 dark:border-zinc-700">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[180px]">{cat}</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={localConfig.categoryThresholds[cat] ?? 8}
                      onChange={(e) => handleThresholdChange(cat, parseInt(e.target.value) || 1)}
                      className="w-14 px-2 py-1 text-center rounded border bg-slate-50 border-slate-300 text-slate-800 dark:bg-zinc-900 dark:border-zinc-600 dark:text-zinc-200"
                    />
                    <span className="text-[10px] text-slate-400">votes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Defaults</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border text-slate-600 hover:bg-slate-100 border-slate-200 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:border-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-xs cursor-pointer"
              >
                Save Policy
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
