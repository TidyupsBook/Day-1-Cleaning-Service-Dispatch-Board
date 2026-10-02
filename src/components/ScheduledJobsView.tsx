import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Car, 
  Navigation, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Search,
  Filter,
  Users,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  ArrowRight,
  Plus,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Zap,
  CalendarDays,
  ListFilter,
  Layers,
  FileCheck,
  CheckCircle
} from 'lucide-react';
import { Technician } from '../types/dispatch';
import { 
  ScheduledJobItem, 
  UnscheduledJobItem,
  CLEANER_COLOR_MAP, 
  getCleanerColor, 
  JOBBER_TEAM_MEMBERS 
} from '../data/jobberCalendarData';

export type { ScheduledJobItem, UnscheduledJobItem };

interface ScheduledJobsViewProps {
  jobs: ScheduledJobItem[];
  technicians: Technician[];
  unscheduledJobs?: UnscheduledJobItem[];
  onSelectJobOnMap?: (job: ScheduledJobItem) => void;
  onRefreshJobs?: () => void;
  onUpdateJobAssignment?: (jobId: string, assignedCleaners: string[]) => void;
  onApproveUnscheduledJob?: (jobId: string) => void;
  onScheduleUnscheduledJob?: (params: { 
    jobId: string; 
    date: string; 
    time: string; 
    cleaners: string[]; 
    durationHours?: number; 
    notes?: string; 
  }) => void;
  initialTab?: 'CALENDAR' | 'LIST' | 'UNSCHEDULED';
}

// Great-circle Haversine distance calculator in KM & estimated drive minutes in Edmonton
function calculateEdmontonTravel(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): { distanceKm: number; driveMinutes: number } {
  const R = 6371; // Earth radius in km
  const dLat = ((destLat - originLat) * Math.PI) / 180;
  const dLng = ((destLng - originLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((originLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  const roadKm = Math.round(straightLineKm * 1.35 * 10) / 10;
  const driveMinutes = Math.max(5, Math.round((roadKm / 42) * 60));

  return { distanceKm: roadKm, driveMinutes };
}

// Available months for navigation (August 2026 to January 2027)
const AVAILABLE_MONTHS = [
  { year: 2026, month: 7, label: 'August 2026', shortLabel: 'Aug 2026' },    // 0-indexed month
  { year: 2026, month: 8, label: 'September 2026', shortLabel: 'Sep 2026' },
  { year: 2026, month: 9, label: 'October 2026', shortLabel: 'Oct 2026' },
  { year: 2026, month: 10, label: 'November 2026', shortLabel: 'Nov 2026' },
  { year: 2026, month: 11, label: 'December 2026', shortLabel: 'Dec 2026' },
  { year: 2027, month: 0, label: 'January 2027', shortLabel: 'Jan 2027' },
];

export const ScheduledJobsView: React.FC<ScheduledJobsViewProps> = ({
  jobs,
  technicians,
  unscheduledJobs = [],
  onSelectJobOnMap,
  onRefreshJobs,
  onUpdateJobAssignment,
  onApproveUnscheduledJob,
  onScheduleUnscheduledJob,
  initialTab = 'CALENDAR',
}) => {
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'LIST' | 'UNSCHEDULED'>(initialTab);
  
  // Calendar month state: Defaults to October 2026 (matching Jobber screenshot & today)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 9 = October (0-indexed)

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCleanerFilter, setSelectedCleanerFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobs[0]?.id || null);

  // Cleaner assignment editor modal state
  const [editingJobForCleaners, setEditingJobForCleaners] = useState<ScheduledJobItem | null>(null);
  const [tempAssignedCleaners, setTempAssignedCleaners] = useState<string[]>([]);
  const [assignmentNotice, setAssignmentNotice] = useState<string | null>(null);

  // Unscheduled job schedule modal state
  const [schedulingUnscheduledJob, setSchedulingUnscheduledJob] = useState<UnscheduledJobItem | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>('2026-10-05');
  const [scheduleTime, setScheduleTime] = useState<string>('10:00');
  const [scheduleDuration, setScheduleDuration] = useState<number>(2.5);
  const [scheduleCleaners, setScheduleCleaners] = useState<string[]>([]);
  const [scheduleNotes, setScheduleNotes] = useState<string>('');
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);

  // Dynamic cleaners synchronized from staff roster / technicians
  const dynamicCleaners = useMemo(() => {
    if (technicians && technicians.length > 0) {
      return technicians.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color || getCleanerColor(t.name),
        phone: t.phone,
        vanUnit: t.vanNumber,
        active: t.active !== false && t.status !== 'OFF_DUTY',
      }));
    }
    return JOBBER_TEAM_MEMBERS.map((t) => ({ ...t, active: true }));
  }, [technicians]);

  // Cleaners actively working and available for new dispatch
  const activeCleaners = useMemo(() => {
    return dynamicCleaners.filter((c) => c.active);
  }, [dynamicCleaners]);

  // Cleaners archived or no longer working
  const archivedCleaners = useMemo(() => {
    return dynamicCleaners.filter((c) => !c.active);
  }, [dynamicCleaners]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // October 2026
  };

  // Month name formatting
  const currentMonthDate = new Date(currentYear, currentMonth, 1);
  const currentMonthLabel = currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Filter jobs based on search, cleaner, service, and month
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.serviceAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.visitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.assignedCleaners.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCleaner =
        selectedCleanerFilter === 'ALL' ||
        job.assignedCleaners.some((c) => c.toLowerCase().includes(selectedCleanerFilter.toLowerCase()));

      const matchesService = serviceFilter === 'ALL' || job.serviceType === serviceFilter;

      return matchesSearch && matchesCleaner && matchesService;
    });
  }, [jobs, searchQuery, selectedCleanerFilter, serviceFilter]);

  // Jobs specifically in the active calendar month
  const jobsInCurrentMonth = useMemo(() => {
    return filteredJobs.filter((job) => {
      try {
        const d = new Date(job.startAt);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      } catch {
        return false;
      }
    });
  }, [filteredJobs, currentYear, currentMonth]);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobsInCurrentMonth[0] || filteredJobs[0] || null;

  // Format date & time nicely
  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        dateStr: d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }),
        timeStr: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        dayOfMonth: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
      };
    } catch {
      return { dateStr: 'Upcoming', timeStr: '9:00 AM', dayOfMonth: 1, month: 9, year: 2026 };
    }
  };

  // Generate calendar grid cells (42 cells: 6 weeks x 7 days, starting on Sunday)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      dateString: string;
      jobsOnDate: ScheduledJobItem[];
    }> = [];

    // Previous month filler days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      const jobsOnDate = filteredJobs.filter((j) => j.startAt.startsWith(dateStr));
      cells.push({
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        dateString: dateStr,
        jobsOnDate,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const yearStr = currentYear;
      const monthStr = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

      const isToday = currentYear === 2026 && currentMonth === 9 && day === 1; // Today in prototype is Oct 1, 2026
      const jobsOnDate = filteredJobs.filter((j) => j.startAt.startsWith(dateStr));

      cells.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: true,
        isToday,
        dateString: dateStr,
        jobsOnDate,
      });
    }

    // Next month filler days (fill up to 35 or 42 cells)
    const remaining = (cells.length > 35 ? 42 : 35) - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(currentYear, currentMonth + 1, day);
      const dateStr = d.toISOString().split('T')[0];
      const jobsOnDate = filteredJobs.filter((j) => j.startAt.startsWith(dateStr));
      cells.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: false,
        dateString: dateStr,
        jobsOnDate,
      });
    }

    return cells;
  }, [currentYear, currentMonth, filteredJobs]);

  // Open cleaner assignment editor for a job
  const handleOpenAssignModal = (job: ScheduledJobItem) => {
    setEditingJobForCleaners(job);
    setTempAssignedCleaners([...job.assignedCleaners]);
    setAssignmentNotice(null);
  };

  // Toggle cleaner in multi-assignment editor
  const handleToggleCleanerAssignment = (cleanerName: string) => {
    setTempAssignedCleaners((prev) => {
      if (prev.includes(cleanerName)) {
        return prev.filter((c) => c !== cleanerName);
      } else {
        return [...prev, cleanerName];
      }
    });
  };

  // Save updated cleaner assignment
  const handleSaveCleanerAssignment = async () => {
    if (!editingJobForCleaners) return;
    if (tempAssignedCleaners.length === 0) {
      setAssignmentNotice('Please assign at least one cleaner.');
      return;
    }

    const updatedJobId = editingJobForCleaners.id;
    if (onUpdateJobAssignment) {
      onUpdateJobAssignment(updatedJobId, tempAssignedCleaners);
    }

    // Call server endpoint
    try {
      await fetch('/api/jobber/update-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId: updatedJobId,
          assignedCleaners: tempAssignedCleaners,
        }),
      });
    } catch (err) {
      console.warn('Could not sync visit assignment to server:', err);
    }

    // Update local jobs array in parent through callback or refresh
    setAssignmentNotice(`Saved! Attached ${tempAssignedCleaners.join(' & ')} to ${editingJobForCleaners.visitNumber}`);
    setTimeout(() => {
      setEditingJobForCleaners(null);
      setAssignmentNotice(null);
    }, 1200);
  };

  // Open scheduling modal for an unscheduled job
  const handleOpenScheduleModal = (ujob: UnscheduledJobItem) => {
    setSchedulingUnscheduledJob(ujob);
    setScheduleDate('2026-10-05');
    setScheduleTime('10:00');
    setScheduleDuration(2.5);
    setScheduleCleaners(ujob.preferredCleaners || ['Melissa Clarke', 'Joel MBATCHOU']);
    setScheduleNotes(ujob.notes || '');
    setScheduleNotice(null);
  };

  const handleToggleScheduleCleaner = (cleanerName: string) => {
    setScheduleCleaners((prev) => {
      if (prev.includes(cleanerName)) {
        return prev.filter((c) => c !== cleanerName);
      } else {
        return [...prev, cleanerName];
      }
    });
  };

  const handleConfirmScheduleUnscheduledJob = async () => {
    if (!schedulingUnscheduledJob) return;
    if (scheduleCleaners.length === 0) {
      setScheduleNotice('Please select at least 1 cleaner (or 2 cleaners together).');
      return;
    }

    if (onScheduleUnscheduledJob) {
      onScheduleUnscheduledJob({
        jobId: schedulingUnscheduledJob.id,
        date: scheduleDate,
        time: scheduleTime,
        cleaners: scheduleCleaners,
        durationHours: scheduleDuration,
        notes: scheduleNotes,
      });
    }

    // Post to server
    try {
      const res = await fetch('/api/jobber/schedule-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: schedulingUnscheduledJob.id,
          scheduledDate: scheduleDate,
          scheduledTime: scheduleTime,
          durationHours: scheduleDuration,
          assignedCleaners: scheduleCleaners,
          notes: scheduleNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScheduleNotice(`Success! Job ${schedulingUnscheduledJob.jobNumber} scheduled and pushed to Jobber.`);
        setTimeout(() => {
          setSchedulingUnscheduledJob(null);
          setScheduleNotice(null);
          if (onRefreshJobs) onRefreshJobs();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to schedule job:', err);
    }
  };

  // Quick approve unscheduled job
  const handleApproveJob = async (jobId: string) => {
    if (onApproveUnscheduledJob) {
      onApproveUnscheduledJob(jobId);
    }
    try {
      await fetch('/api/jobber/approve-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (onRefreshJobs) onRefreshJobs();
    } catch (err) {
      console.error('Error approving job in Jobber:', err);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-slate-100 font-sans">
      {/* Top Header Bar with View Switchers & Jobber Live Stats */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                Jobber Schedule &amp; Team Calendar
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Jobber Synced</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {jobs.length} scheduled visits across August – December 2026 • 20 Cleaners with color coordination
            </p>
          </div>
        </div>

        {/* View Switchers: Calendar, List, Unscheduled Jobs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('CALENDAR')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'CALENDAR'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>Month Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('LIST')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'LIST'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-blue-600" />
              <span>Job List &amp; Routes ({filteredJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('UNSCHEDULED')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'UNSCHEDULED'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Unscheduled Jobs</span>
              {unscheduledJobs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800 font-bold">
                  {unscheduledJobs.length}
                </span>
              )}
            </button>
          </div>

          {onRefreshJobs && (
            <button
              onClick={onRefreshJobs}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Jobber</span>
            </button>
          )}
        </div>
      </div>

      {/* Cleaner Color Legend & Filter Strip */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2 shrink-0 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Active Cleaners ({activeCleaners.length}):</span>
        </span>

        <button
          onClick={() => setSelectedCleanerFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
            selectedCleanerFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          All Cleaners
        </button>

        {dynamicCleaners.map((tm) => {
          const isSelected = selectedCleanerFilter === tm.name;
          const assignedCount = jobsInCurrentMonth.filter((j) =>
            j.assignedCleaners.some((c) => c.toLowerCase().includes(tm.name.toLowerCase()))
          ).length;

          return (
            <button
              key={tm.id}
              onClick={() => setSelectedCleanerFilter(isSelected ? 'ALL' : tm.name)}
              className={`px-2 py-0.8 rounded-lg text-[11px] font-semibold shrink-0 flex items-center gap-1.5 transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-white shadow-xs ring-2 ring-blue-500 border-transparent font-bold'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              } ${!tm.active ? 'opacity-60 bg-slate-100' : ''}`}
              title={`${tm.name} (${tm.vanUnit || 'Cleaner'}) ${!tm.active ? '• Archived / Off-Duty' : ''}`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs ${!tm.active ? 'grayscale' : ''}`}
                style={{ backgroundColor: tm.color }}
              />
              <span className={`truncate max-w-[120px] ${!tm.active ? 'line-through text-slate-500' : ''}`}>
                {tm.name}
              </span>
              {!tm.active && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-mono">
                  Off
                </span>
              )}
              {assignedCount > 0 && (
                <span
                  className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-white shrink-0"
                  style={{ backgroundColor: tm.color }}
                >
                  {assignedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'CALENDAR' ? (
        <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 gap-3">
          {/* Calendar Navigation Bar (Prev Month, Month Selector, Next Month, Today) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 cursor-pointer active:scale-95"
                title="Go back one month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight min-w-[170px] text-center">
                  {currentMonthLabel}
                </h2>

                <select
                  value={`${currentYear}-${currentMonth}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split('-').map(Number);
                    setCurrentYear(y);
                    setCurrentMonth(m);
                  }}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  {AVAILABLE_MONTHS.map((m) => (
                    <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 cursor-pointer active:scale-95"
                title="Go forward one month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleGoToToday}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
              >
                Today (Oct 2026)
              </button>
            </div>

            {/* Quick stats on this month */}
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Visits this month: <strong>{jobsInCurrentMonth.length}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                <span>Active Cleaners: <strong>{new Set(jobsInCurrentMonth.flatMap(j => j.assignedCleaners)).size} / 20</strong></span>
              </div>
            </div>
          </div>

          {/* Month Calendar Grid (7 columns: Sun - Sat) */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center font-bold text-xs text-slate-600 py-2 shrink-0">
              <div className="text-rose-600">Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div className="text-purple-600">Sat</div>
            </div>

            {/* Grid Days */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-5 overflow-y-auto divide-x divide-y divide-slate-100 bg-slate-100/40">
              {calendarCells.map((cell, idx) => {
                return (
                  <div
                    key={`${cell.dateString}-${idx}`}
                    className={`min-h-[105px] p-1.5 flex flex-col justify-between transition-colors overflow-hidden ${
                      cell.isCurrentMonth
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-slate-50/50 text-slate-400 opacity-60'
                    } ${cell.isToday ? 'bg-amber-50/40 ring-2 ring-inset ring-amber-400' : ''}`}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between mb-1 shrink-0">
                      <span
                        className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          cell.isToday
                            ? 'bg-pink-600 text-white font-extrabold shadow-xs'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {cell.jobsOnDate.length > 0 && (
                        <span className="text-[10px] font-mono font-semibold text-slate-500">
                          {cell.jobsOnDate.length} job{cell.jobsOnDate.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Scheduled Jobs in this cell */}
                    <div className="flex-1 space-y-1 overflow-y-auto pr-0.5 scrollbar-none">
                      {cell.jobsOnDate.map((job) => {
                        const { timeStr } = formatDateTime(job.startAt);
                        const isSelected = activeJob?.id === job.id;
                        const hasMultipleCleaners = job.assignedCleaners.length > 1;
                        const primaryColor = getCleanerColor(job.assignedCleaners[0] || 'Melissa Clarke');
                        const secondaryColor = hasMultipleCleaners
                          ? getCleanerColor(job.assignedCleaners[1])
                          : null;

                        return (
                          <div
                            key={job.id}
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setActiveTab('LIST');
                            }}
                            className={`p-1 rounded-md text-[10px] font-medium leading-tight cursor-pointer transition-all border shadow-2xs group relative ${
                              isSelected
                                ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/90'
                                : 'bg-white hover:bg-slate-100 border-slate-200'
                            }`}
                            style={{
                              borderLeftWidth: '3.5px',
                              borderLeftColor: primaryColor,
                            }}
                            title={`${job.clientName} (${job.serviceType}) • Time: ${timeStr} • Cleaners: ${job.assignedCleaners.join(' & ')}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-900 truncate">
                                {job.clientName}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500 shrink-0">
                                {timeStr.split(' ')[0]}
                              </span>
                            </div>

                            {/* Cleaner Tags with Color Dots */}
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {job.assignedCleaners.map((cName) => {
                                const cColor = getCleanerColor(cName);
                                return (
                                  <span
                                    key={cName}
                                    className="inline-flex items-center gap-1 px-1 py-0.2 rounded text-[9px] font-semibold text-slate-700 bg-slate-100"
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0"
                                      style={{ backgroundColor: cColor }}
                                    />
                                    <span className="truncate max-w-[70px]">{cName.split(' ')[0]}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'LIST' ? (
        /* List & Dispatch Route View */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
          {/* Left Column: Filterable Visit List */}
          <div className="w-full md:w-96 lg:w-[420px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-full overflow-hidden">
            {/* Header & Search */}
            <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                      <CalendarIcon className="w-3.5 h-3.5 text-white" />
                    </span>
                    <span>Scheduled Jobs ({filteredJobs.length})</span>
                  </h2>
                  <p className="text-[11px] text-slate-500">Live synced with Jobber database</p>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search client, address, cleaner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={selectedCleanerFilter}
                  onChange={(e) => setSelectedCleanerFilter(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Cleaners ({activeCleaners.length})</option>
                  <optgroup label="Active Working Cleaners">
                    {activeCleaners.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                  {archivedCleaners.length > 0 && (
                    <optgroup label="Archived / Not Working">
                      {archivedCleaners.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} (Archived)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Services</option>
                  <option value="Standard Cleaning">Standard Cleaning</option>
                  <option value="Deep Cleaning">Deep Cleaning</option>
                  <option value="Move-Out Cleaning">Move-Out Cleaning</option>
                </select>
              </div>
            </div>

            {/* Scrollable Job List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
              {filteredJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs space-y-3">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                  <div>
                    <p className="font-bold text-slate-700">No Scheduled Jobs Found</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Try clearing search or switching cleaners in the filter above.
                    </p>
                  </div>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = activeJob?.id === job.id;
                  const { dateStr, timeStr } = formatDateTime(job.startAt);

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-300'
                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {job.visitNumber}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                            job.serviceType === 'Move-Out Cleaning'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : job.serviceType === 'Deep Cleaning'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {job.serviceType}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 leading-snug">{job.clientName}</h3>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{job.serviceAddress}</span>
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 text-slate-600 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{dateStr} • {timeStr}</span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-700 font-semibold">
                          <Users className="w-3 h-3 text-blue-600" />
                          <span>{job.assignedCleaners.length} Cleaner{job.assignedCleaners.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Cleaners Tag Line with Real Colors */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {job.assignedCleaners.map((cName) => {
                          const color = getCleanerColor(cName);
                          return (
                            <span
                              key={cName}
                              className="px-2 py-0.5 rounded-md font-semibold text-[10px] flex items-center gap-1.5 border border-slate-200"
                              style={{ backgroundColor: `${color}15`, color }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                              <span>{cName}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Job Detail & Commute Calculator */}
          <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-slate-50">
            {activeJob ? (
              <div className="max-w-3xl mx-auto space-y-4">
                {/* Main Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {activeJob.visitNumber}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {activeJob.status}
                        </span>
                      </div>
                      <h1 className="text-lg sm:text-xl font-bold text-slate-900">{activeJob.clientName}</h1>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeJob.clientPhone}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAssignModal(activeJob)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Attach / Edit Cleaners</span>
                      </button>

                      <a
                        href={activeJob.jobberWebUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Open in Jobber</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Service & Address Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Job Address
                      </span>
                      <p className="font-bold text-slate-900 text-sm">{activeJob.serviceAddress}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Edmonton, Alberta</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Scheduled Time
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {formatDateTime(activeJob.startAt).dateStr}
                      </p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {formatDateTime(activeJob.startAt).timeStr} – {formatDateTime(activeJob.endAt).timeStr}
                      </p>
                    </div>
                  </div>

                  {/* Assigned Cleaners & Commute */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <span>Assigned Cleaners ({activeJob.assignedCleaners.length}) &amp; Commute from Home Hubs</span>
                      </h3>
                      <button
                        onClick={() => handleOpenAssignModal(activeJob)}
                        className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
                      >
                        + Change Cleaners
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {activeJob.assignedCleaners.map((cleanerName) => {
                        const cleaner = technicians.find(
                          (t) =>
                            t.name.toLowerCase().includes(cleanerName.toLowerCase()) ||
                            cleanerName.toLowerCase().includes(t.name.toLowerCase())
                        );

                        const originLat = cleaner ? cleaner.depotLocation.lat : 53.4184;
                        const originLng = cleaner ? cleaner.depotLocation.lng : -113.5786;
                        const homeAddress = cleaner?.homeAddress || cleaner?.depotLocation.address || 'Edmonton, AB';
                        const color = getCleanerColor(cleanerName);

                        const { distanceKm, driveMinutes } = calculateEdmontonTravel(
                          originLat,
                          originLng,
                          activeJob.lat,
                          activeJob.lng
                        );

                        return (
                          <div
                            key={cleanerName}
                            className="p-3 rounded-xl border bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            style={{ borderLeftWidth: '4px', borderLeftColor: color }}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs shrink-0"
                                style={{ backgroundColor: color }}
                              >
                                {cleanerName.slice(0, 2).toUpperCase()}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{cleanerName}</span>
                                  <span className="text-[10px] font-normal text-slate-500">
                                    ({cleaner?.vanNumber || 'Mobile Unit'})
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>Home Hub: {homeAddress}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">Est. Drive</span>
                                <span className="font-extrabold text-blue-700 flex items-center gap-1 justify-end">
                                  <Car className="w-3.5 h-3.5" />
                                  <span>{driveMinutes} mins</span>
                                </span>
                              </div>

                              <div className="text-right pl-3 border-l border-slate-200">
                                <span className="text-[10px] text-slate-400 block">Distance</span>
                                <span className="font-bold text-slate-800 font-mono">
                                  {distanceKm} km
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {activeJob.notes && (
                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs">
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                        Jobber Notes &amp; Dispatch Instructions
                      </span>
                      <p className="text-slate-700">{activeJob.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Select a job from the list to view route and cleaner details.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Unscheduled Jobs Tab (Sync with Jobber) */
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <AlertCircle className="w-4 h-4" />
                  </span>
                  <span>Unscheduled Jobs in Jobber ({unscheduledJobs.length})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  These customer jobs need approval and cleaner assignment. Approving updates Jobber in real-time.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg font-bold border border-amber-200">
                  {unscheduledJobs.filter(j => j.status === 'UNSCHEDULED').length} Pending Approval
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold border border-emerald-200">
                  {unscheduledJobs.filter(j => j.status === 'APPROVED').length} Ready to Schedule
                </span>
              </div>
            </div>

            {/* List of Unscheduled Jobs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unscheduledJobs.map((ujob) => {
                const isApproved = ujob.status === 'APPROVED';
                const isScheduled = ujob.status === 'SCHEDULED';

                return (
                  <div
                    key={ujob.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {ujob.jobNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            isScheduled
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {ujob.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{ujob.clientName}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{ujob.serviceAddress}</span>
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Service</span>
                          <span className="font-bold text-slate-800">{ujob.serviceType}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Quoted Amount</span>
                          <span className="font-extrabold text-emerald-700 font-mono">${ujob.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-slate-600 bg-purple-50/50 p-2 rounded-xl border border-purple-100/60">
                        <p className="font-semibold text-purple-900">Requested Window: {ujob.requestedWindow}</p>
                        {ujob.notes && <p className="text-[11px] text-slate-500 mt-0.5">{ujob.notes}</p>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={ujob.jobberWebUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Jobber</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <div className="flex items-center gap-2">
                        {!isApproved && !isScheduled && (
                          <button
                            onClick={() => handleApproveJob(ujob.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Approve in Jobber
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenScheduleModal(ujob)}
                          className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Attach Cleaners &amp; Schedule</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ⭐ MULTI-CLEANER ATTACHMENT MODAL (Supports 2 Cleaners Together) ⭐ */}
      {editingJobForCleaners && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Attach Cleaners to Job</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingJobForCleaners.clientName} ({editingJobForCleaners.visitNumber})
                </p>
              </div>

              <button
                onClick={() => setEditingJobForCleaners(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 20-Cleaner Multi-Select */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Dual Cleaner Attachment Supported</span>
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  You can attach 2 cleaners (or any team configuration) to this job together. Their colors will be displayed across the schedule and synced to Jobber.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1">
                <span>Selected: {tempAssignedCleaners.length} Cleaner{tempAssignedCleaners.length !== 1 ? 's' : ''}</span>
                <span className="text-purple-700">{tempAssignedCleaners.join(', ') || 'None'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeCleaners.map((tm) => {
                  const isChecked = tempAssignedCleaners.includes(tm.name);

                  return (
                    <div
                      key={tm.id}
                      onClick={() => handleToggleCleanerAssignment(tm.name)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isChecked
                          ? 'bg-purple-50/80 border-purple-400 shadow-2xs ring-1 ring-purple-300'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: tm.color }}
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{tm.name}</p>
                          <p className="text-[10px] text-slate-500">{tm.vanUnit || 'Mobile Unit'}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Archived Cleaners Notice & Reassignment Guidance */}
              {archivedCleaners.some((ac) => tempAssignedCleaners.includes(ac.name)) && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Former cleaner assigned: </span>
                    <span>
                      This job is currently assigned to an archived cleaner (
                      {archivedCleaners.filter((ac) => tempAssignedCleaners.includes(ac.name)).map((ac) => ac.name).join(', ')}
                      ). Select an active cleaner above to reassign this visit.
                    </span>
                  </div>
                </div>
              )}

              {assignmentNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                  {assignmentNotice}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                onClick={() => setEditingJobForCleaners(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveCleanerAssignment}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save &amp; Sync to Jobber</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ SCHEDULE UNSCHEDULED JOB MODAL (Attach 2 Cleaners + Date/Time) ⭐ */}
      {schedulingUnscheduledJob && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-pink-600" />
                  <span>Schedule Job #{schedulingUnscheduledJob.jobNumber}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {schedulingUnscheduledJob.clientName} • {schedulingUnscheduledJob.serviceType}
                </p>
              </div>

              <button
                onClick={() => setSchedulingUnscheduledJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Est. Duration (Hours)
                </label>
                <select
                  value={scheduleDuration}
                  onChange={(e) => setScheduleDuration(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value={1.5}>1.5 Hours</option>
                  <option value={2.0}>2.0 Hours</option>
                  <option value={2.5}>2.5 Hours (Standard)</option>
                  <option value={3.0}>3.0 Hours</option>
                  <option value={4.0}>4.0 Hours (Deep Clean)</option>
                </select>
              </div>

              {/* Attach 2 Cleaners */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Attach Cleaners ({scheduleCleaners.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                  {activeCleaners.map((tm) => {
                    const isChecked = scheduleCleaners.includes(tm.name);
                    return (
                      <div
                        key={tm.id}
                        onClick={() => handleToggleScheduleCleaner(tm.name)}
                        className={`p-2 rounded-lg border cursor-pointer text-xs flex items-center justify-between gap-1 transition-all ${
                          isChecked
                            ? 'bg-blue-50 border-blue-400 font-bold'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: tm.color }}
                          />
                          <span className="truncate">{tm.name}</span>
                        </span>
                        {isChecked && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Notes for Cleaners
                </label>
                <textarea
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="Key instructions, tandem cleaning notes..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  rows={2}
                />
              </div>

              {scheduleNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                  {scheduleNotice}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                onClick={() => setSchedulingUnscheduledJob(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmScheduleUnscheduledJob}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve &amp; Push to Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
