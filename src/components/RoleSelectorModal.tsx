import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Lock, 
  Check, 
  LogOut, 
  ChevronRight, 
  Key, 
  Truck,
  Building,
  Radio,
  Search,
  KeyRound
} from 'lucide-react';
import { AppUser, AppUserRole, APP_USERS } from '../types/authAndChat';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onSelectUser: (user: AppUser) => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | AppUserRole>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [selectedPendingUser, setSelectedPendingUser] = useState<AppUser | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const filteredUsers = APP_USERS.filter((u) => {
    if (selectedRoleFilter !== 'ALL' && u.role !== selectedRoleFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.assignedVan && u.assignedVan.toLowerCase().includes(q)) ||
      u.title.toLowerCase().includes(q)
    );
  });

  const handleConfirmLogin = (user: AppUser) => {
    // If PIN entered, verify (or bypass if empty for seamless testing)
    if (pinInput.trim() && user.pin && pinInput.trim() !== user.pin) {
      setErrorMessage(`Incorrect PIN for ${user.name}. Hint: default PIN is ${user.pin}`);
      return;
    }

    try {
      localStorage.setItem('bookmycleaning_active_user_id', user.id);
    } catch (e) {
      console.warn('localStorage error:', e);
    }

    onSelectUser(user);
    onClose();
    setSelectedPendingUser(null);
    setPinInput('');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-pink-300 uppercase tracking-wider block">
                Multi-User Authentication &amp; RBAC
              </span>
              <h2 className="text-lg font-black text-white">Login &amp; Switch Account Session</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current active session: <strong className="text-pink-300">{currentUser.name}</strong> ({currentUser.role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 3 Role Privilege Tiers */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
          <div className={`p-2.5 rounded-2xl border transition-all ${
            currentUser.role === 'OWNER' 
              ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400/20' 
              : 'bg-white border-slate-200'
          }`}>
            <span className="font-black text-purple-900 block flex items-center justify-center gap-1">
              <span>👑</span> Owner (1)
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">
              Full accounting, billing, quotes, APIs &amp; all messaging
            </span>
          </div>

          <div className={`p-2.5 rounded-2xl border transition-all ${
            currentUser.role === 'DISPATCHER' 
              ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-400/20' 
              : 'bg-white border-slate-200'
          }`}>
            <span className="font-black text-pink-900 block flex items-center justify-center gap-1">
              <span>📡</span> Dispatcher (1)
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">
              Territory map, fleet routing, ticket assignments &amp; chat
            </span>
          </div>

          <div className={`p-2.5 rounded-2xl border transition-all ${
            currentUser.role === 'CLEANER' 
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20' 
              : 'bg-white border-slate-200'
          }`}>
            <span className="font-black text-emerald-900 block flex items-center justify-center gap-1">
              <span>🧹</span> Cleaners (14)
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">
              Assigned jobs only, task checklist &amp; internal messaging
            </span>
          </div>
        </div>

        {/* Search & Filter Tabs */}
        <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, van number, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-pink-500 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['ALL', 'OWNER', 'DISPATCHER', 'CLEANER'] as const).map((roleKey) => (
              <button
                key={roleKey}
                onClick={() => setSelectedRoleFilter(roleKey)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRoleFilter === roleKey
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {roleKey === 'ALL' ? 'All (16)' : roleKey === 'OWNER' ? 'Owner' : roleKey === 'DISPATCHER' ? 'Dispatcher' : 'Cleaners (14)'}
              </button>
            ))}
          </div>
        </div>

        {/* User Selection List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
          {filteredUsers.map((u) => {
            const isCurrent = u.id === currentUser.id;
            const isSelected = selectedPendingUser?.id === u.id;

            return (
              <div
                key={u.id}
                className={`p-3 rounded-2xl border text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-400 ring-2 ring-pink-500/20 shadow-xs'
                    : isSelected
                    ? 'bg-white border-purple-400 ring-2 ring-purple-400/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    u.role === 'OWNER'
                      ? 'bg-purple-600 text-white'
                      : u.role === 'DISPATCHER'
                      ? 'bg-pink-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {u.role === 'OWNER' ? '👑' : u.role === 'DISPATCHER' ? '📡' : '🧹'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 truncate">{u.name}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider font-mono ${
                        u.role === 'OWNER'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'DISPATCHER'
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {u.title} {u.assignedVan ? `• ${u.assignedVan}` : ''}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">
                      {u.email} • {u.phone}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  {isCurrent ? (
                    <span className="px-2.5 py-1 rounded-xl bg-pink-100 text-pink-700 font-extrabold text-[10px] flex items-center gap-1 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Now
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConfirmLogin(u)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 text-white text-xs font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>Log In</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="text-[11px]">
            Cleaners are strictly restricted to their individual van stops, tasks &amp; team messaging.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

