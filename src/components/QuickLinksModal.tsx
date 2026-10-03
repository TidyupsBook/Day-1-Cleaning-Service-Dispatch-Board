import React from 'react';
import { 
  Zap, 
  X, 
  Calendar, 
  AlertCircle, 
  Map, 
  Users, 
  FileCheck, 
  CreditCard, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  Plus, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Download,
  GitBranch,
  FileSpreadsheet
} from 'lucide-react';
import { JOBBER_TEAM_MEMBERS } from '../data/jobberCalendarData';

interface QuickLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (view: 'MAP' | 'CUSTOMER_PORTAL' | 'SCHEDULED_JOBS' | 'QUOTES' | 'INVOICES' | 'LEGAL', subTab?: string) => void;
  onOpenNewTicket?: () => void;
  onOpenTeamChat?: () => void;
  onOpenQuoPhone?: () => void;
  onOpenStaffRoster?: () => void;
  staffCount?: number;
  unscheduledJobsCount?: number;
  scheduledJobsCount?: number;
}

export const QuickLinksModal: React.FC<QuickLinksModalProps> = ({
  isOpen,
  onClose,
  onNavigateTo,
  onOpenNewTicket,
  onOpenTeamChat,
  onOpenQuoPhone,
  onOpenStaffRoster,
  staffCount = 24,
  unscheduledJobsCount = 6,
  scheduledJobsCount = 192,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">Quick Links &amp; Actions</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white">
                  Jobber Dispatch
                </span>
              </div>
              <p className="text-xs text-white/80">
                Instant shortcuts to Jobber schedules, unscheduled jobs, live map, and team roster
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Primary Operations Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>📅 Jobber Core Operations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Scheduled Calendar */}
              <button
                onClick={() => {
                  onNavigateTo('SCHEDULED_JOBS', 'CALENDAR');
                  onClose();
                }}
                className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition-all text-left flex items-start justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors flex items-center gap-1.5">
                      <span>Schedule &amp; Calendar</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-200 text-purple-900 font-bold">
                        {scheduledJobsCount}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Month grid (Aug – Dec 2026) with 20 cleaner color codes
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
              </button>

              {/* Unscheduled Jobs */}
              <button
                onClick={() => {
                  onNavigateTo('SCHEDULED_JOBS', 'UNSCHEDULED');
                  onClose();
                }}
                className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-all text-left flex items-start justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors flex items-center gap-1.5">
                      <span>Unscheduled Jobs</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-200 text-amber-900 font-bold">
                        {unscheduledJobsCount}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Approve in Jobber &amp; attach dual cleaners
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
              </button>

              {/* Live Dispatch Map */}
              <button
                onClick={() => {
                  onNavigateTo('MAP');
                  onClose();
                }}
                className="p-3.5 rounded-2xl border border-pink-200 bg-pink-50/50 hover:bg-pink-100/60 transition-all text-left flex items-start justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Map className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-pink-700 transition-colors">
                      Live Fleet Dispatch Map
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Edmonton real-time routes, traffic, &amp; technician GPS
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
              </button>

              {/* Quotes Pipeline */}
              <button
                onClick={() => {
                  onNavigateTo('QUOTES');
                  onClose();
                }}
                className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-all text-left flex items-start justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                      Quotes &amp; Client Approvals
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Converted quotes synced from Jobber GraphQL API
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
              </button>
            </div>
          </div>

          {/* Quick Actions & Communication */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>⚡ Actions &amp; Communication</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {onOpenNewTicket && (
                <button
                  onClick={() => {
                    onOpenNewTicket();
                    onClose();
                  }}
                  className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">New Job Ticket</h5>
                    <p className="text-[10px] text-slate-500">Manual Intake</p>
                  </div>
                </button>
              )}

              {onOpenTeamChat && (
                <button
                  onClick={() => {
                    onOpenTeamChat();
                    onClose();
                  }}
                  className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Team Chat</h5>
                    <p className="text-[10px] text-slate-500">Cleaner Broadcast</p>
                  </div>
                </button>
              )}

              {onOpenQuoPhone && (
                <button
                  onClick={() => {
                    onOpenQuoPhone();
                    onClose();
                  }}
                  className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Quo Phone</h5>
                    <p className="text-[10px] text-slate-500">VoIP &amp; AI Calls</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* 20 Cleaners Team Roster Color Strip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Jobber Team Roster ({staffCount} Staff)</span>
              </h3>
              {onOpenStaffRoster && (
                <button
                  onClick={() => {
                    onOpenStaffRoster();
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3 h-3 text-purple-700" />
                  <span>Sync Spreadsheet (CSV)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50/50">
              {JOBBER_TEAM_MEMBERS.map((tm) => (
                <div
                  key={tm.id}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-xs truncate shadow-2xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: tm.color }}
                  />
                  <span className="truncate text-[11px] font-semibold text-slate-800">{tm.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* External Jobber Dashboard Link */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                JB
              </div>
              <div>
                <p className="font-extrabold text-emerald-950">Jobber Direct Web Dashboard</p>
                <p className="text-[11px] text-emerald-700">Open secure.getjobber.com in a new tab</p>
              </div>
            </div>

            <a
              href="https://secure.getjobber.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <span>Open Jobber</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Download Repository ZIP for SourceTree / Git */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <GitBranch className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <span>SourceTree / Git Checkpoint Archive (.ZIP)</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-200 text-indigo-900 font-bold">
                    dispatch.zip
                  </span>
                </p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Full git checkpoint archive with 19 Jobber employees and synchronized schedule. Ready to open in SourceTree.
                </p>
              </div>
            </div>

            <a
              href="/api/download-zip"
              download="dispatch.zip"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download dispatch.zip</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
