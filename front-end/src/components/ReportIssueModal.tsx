import React, { useState } from 'react';
import { 
  Category, 
  Department, 
  LocationHierarchy, 
  UserProfile, 
  IssueReport,
  DuplicateCandidateMatch
} from '../types';
import { 
  CAMPUS_BUILDINGS, 
  BUILDING_FLOORS, 
  PHOTO_PRESETS 
} from '../data/mockData';
import { 
  CATEGORY_TO_DEPARTMENT, 
  findDuplicateCandidate 
} from '../utils/duplicateDetector';
import { 
  X, 
  Upload, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Camera
} from 'lucide-react';

interface ReportIssueModalProps {
  currentUser: UserProfile;
  existingIssues: IssueReport[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitNewIssue: (newIssue: Omit<IssueReport, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'upvotes' | 'upvotedUserIds' | 'timeline' | 'commentsCount' | 'isEscalated'>) => void;
  onTriggerDuplicateFound: (candidate: DuplicateCandidateMatch, pendingReport: any) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  currentUser,
  existingIssues,
  isOpen,
  onClose,
  onSubmitNewIssue,
  onTriggerDuplicateFound,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Electrical & Wiring');
  const [department, setDepartment] = useState<Department>(CATEGORY_TO_DEPARTMENT['Electrical & Wiring']);
  const [isDeptManuallyOverridden, setIsDeptManuallyOverridden] = useState(false);

  // Structured Location Hierarchy
  const [building, setBuilding] = useState<string>(CAMPUS_BUILDINGS[0]);
  const [floor, setFloor] = useState<string>('Ground Floor');
  const [roomArea, setRoomArea] = useState('');
  const [landmarkDetails, setLandmarkDetails] = useState('');

  // Image upload / preset
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewError, setPreviewError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const allDepartments: Department[] = [
    'Electrical & Lighting',
    'Plumbing & Water Supply',
    'Civil & Infrastructure',
    'Housekeeping & Sanitation',
    'IT & AV Equipment',
    'HVAC & Air Conditioning',
    'Campus Security & Safety'
  ];

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    if (!isDeptManuallyOverridden) {
      setDepartment(CATEGORY_TO_DEPARTMENT[newCat]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setPreviewError('File size exceeds 8MB limit. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setPreviewError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setPreviewError('Please enter a brief title for the issue.');
      return;
    }
    if (!roomArea.trim()) {
      setPreviewError('Please specify the Room, Lab, or specific area.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setPreviewError('Please provide a clear description (minimum 10 characters).');
      return;
    }

    setPreviewError('');
    setIsSubmitting(true);

    const location: LocationHierarchy = {
      building,
      floor,
      roomArea: roomArea.trim(),
      landmarkDetails: landmarkDetails.trim() || undefined
    };

    const pendingPayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      department,
      location,
      imageUrl: imageUrl || undefined,
      status: 'Reported' as const,
      priority: (category === 'Electrical & Wiring' || category === 'Unsafe Walkway / Lighting Hazard') ? 'High' as const : 'Normal' as const,
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: (currentUser.role === 'faculty' ? 'faculty' : 'student') as 'student' | 'faculty',
        rollNumber: currentUser.rollNumber,
        department: currentUser.department || 'TIET Campus'
      }
    };

    // Run duplicate detection check against open issues
    const duplicateCandidate = findDuplicateCandidate(
      {
        title: pendingPayload.title,
        description: pendingPayload.description,
        category: pendingPayload.category,
        department: pendingPayload.department,
        location: pendingPayload.location
      },
      existingIssues
    );

    setIsSubmitting(false);

    if (duplicateCandidate) {
      onTriggerDuplicateFound(duplicateCandidate, pendingPayload);
      onClose();
    } else {
      onSubmitNewIssue(pendingPayload);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 theme-warm:bg-[#fcfbf9] rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 theme-warm:border-[#e8e4dc] max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 theme-warm:border-[#e8e4dc] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Building2 className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 theme-warm:text-stone-900">
                Report Campus Issue
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Directly routed to the responsible maintenance division
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {previewError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center space-x-2 text-xs text-rose-700 dark:text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{previewError}</span>
            </div>
          )}

          {/* Reporter Preview Badge */}
          <div className="bg-slate-50 dark:bg-zinc-800/50 theme-warm:bg-[#f5f2eb] border border-slate-200/80 dark:border-zinc-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{currentUser.name}</span>
              <span className="text-slate-500 dark:text-zinc-400">
                ({currentUser.role.toUpperCase()} {currentUser.rollNumber ? `• ${currentUser.rollNumber}` : ''})
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Verified Reporter
            </span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Water leakage from ceiling AC unit in Lab 204"
              className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-zinc-800 theme-warm:bg-[#f5f2eb] border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as Category)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 theme-warm:bg-[#f5f2eb] border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-hidden cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Target Department
                </label>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                  {isDeptManuallyOverridden ? 'Manual Override' : 'Auto-Assigned'}
                </span>
              </div>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value as Department);
                  setIsDeptManuallyOverridden(true);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 theme-warm:bg-[#f5f2eb] border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-hidden cursor-pointer"
              >
                {allDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Hierarchy */}
          <div className="bg-slate-50 dark:bg-zinc-800/50 theme-warm:bg-[#f5f2eb] border border-slate-200/80 dark:border-zinc-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Location Hierarchy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  1. Building <span className="text-rose-500">*</span>
                </label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 cursor-pointer"
                >
                  {CAMPUS_BUILDINGS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  2. Floor <span className="text-rose-500">*</span>
                </label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 cursor-pointer"
                >
                  {BUILDING_FLOORS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  3. Room / Specific Area <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={roomArea}
                  onChange={(e) => setRoomArea(e.target.value)}
                  placeholder="e.g., Room 302, Lab 4, West Washroom"
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  4. Landmark / Details (Optional)
                </label>
                <input
                  type="text"
                  value={landmarkDetails}
                  onChange={(e) => setLandmarkDetails(e.target.value)}
                  placeholder="e.g., Near water purifier, Pillar #3"
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-zinc-800 theme-warm:bg-[#f5f2eb] border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Photo Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>Photo Evidence</span>
              </span>
              <span className="text-[10px] text-slate-400">Optional</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
              <label className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {imageUrl && (
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Photo selected</span>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-rose-600 dark:text-rose-400 hover:underline ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PHOTO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                    imageUrl === preset.url
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent font-semibold'
                      : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {imageUrl && (
              <div className="mt-2.5 rounded-xl overflow-hidden h-28 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 max-w-xs">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
