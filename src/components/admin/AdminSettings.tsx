import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  User, 
  ShieldAlert, 
  Key, 
  Check, 
  Sliders, 
  Bell, 
  Sparkles, 
  Command, 
  Info 
} from 'lucide-react';

interface AdminSettingsProps {
  currentUser: string;
  isAdmin: boolean;
  onToggleAdminRole: (val: boolean) => void;
  onSwitchUser: (partnerId: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  currentUser,
  isAdmin,
  onToggleAdminRole,
  onSwitchUser,
}) => {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleSave = () => {
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Vault Configuration &amp; Role Settings
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Administer active partner persona, toggle test roles, and configure system preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          {successNotice ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Preferences Saved!</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-[#DFBF99]" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Identity */}
        <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#DFBF99]/15">
            <User className="h-4 w-4 text-[#DFBF99]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
              Active Partner Persona
            </h3>
          </div>

          <p className="text-xs text-[#C9B7C3] font-sans">
            Choose which partner persona signs audit actions, seals future letters, and records voice memories:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => onSwitchUser('partner-1')}
              className={`cursor-pointer rounded-xl border p-4 text-center transition ${
                currentUser === 'partner-1'
                  ? 'border-[#DFBF99] bg-[#290E2C] ring-1 ring-[#DFBF99]/50'
                  : 'border-[#DFBF99]/20 bg-[#140516] hover:border-[#DFBF99]/40'
              }`}
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#7D2146] text-[#FAF7F2] text-sm font-serif">
                E
              </div>
              <div className="text-xs font-medium text-[#FAF7F2]">Elena Vance</div>
              <div className="text-[10px] font-mono text-[#DFBF99]">Partner 1 (Creator)</div>
            </div>

            <div
              onClick={() => onSwitchUser('partner-2')}
              className={`cursor-pointer rounded-xl border p-4 text-center transition ${
                currentUser === 'partner-2'
                  ? 'border-[#DFBF99] bg-[#290E2C] ring-1 ring-[#DFBF99]/50'
                  : 'border-[#DFBF99]/20 bg-[#140516] hover:border-[#DFBF99]/40'
              }`}
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#3B173E] text-[#FAF7F2] text-sm font-serif">
                J
              </div>
              <div className="text-xs font-medium text-[#FAF7F2]">Julian Ross</div>
              <div className="text-[10px] font-mono text-[#DFBF99]">Partner 2 (Co-Author)</div>
            </div>
          </div>
        </div>

        {/* Role & Access Simulator */}
        <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#DFBF99]/15">
            <ShieldAlert className="h-4 w-4 text-[#DFBF99]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
              Role Access &amp; Simulation
            </h3>
          </div>

          <p className="text-xs text-[#C9B7C3] font-sans">
            Test the live RLS authorization guard. Toggle the admin role off to simulate the user experience of normal viewers:
          </p>

          <div className="rounded-xl border border-[#DFBF99]/15 bg-[#120514] p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-[#FAF7F2]">
                Admin Privilege State: {isAdmin ? 'GRANTED' : 'REVOKED (Normal User)'}
              </div>
              <div className="text-[11px] text-[#8F7D8A]">
                {isAdmin ? 'Full access to /admin and mutating RLS endpoints' : 'Access Denied page will appear on /admin routes'}
              </div>
            </div>

            <button
              onClick={() => onToggleAdminRole(!isAdmin)}
              className={`rounded-xl px-4 py-2 text-xs font-mono font-medium transition ${
                isAdmin
                  ? 'bg-rose-950 text-rose-300 border border-rose-700 hover:bg-rose-900'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
              }`}
            >
              {isAdmin ? 'Simulate User (Demote)' : 'Restore Admin Role'}
            </button>
          </div>
        </div>

        {/* System Preferences */}
        <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#DFBF99]/15">
            <Sliders className="h-4 w-4 text-[#DFBF99]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
              Vault Editor Behaviors
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-[#200A24] transition">
              <div>
                <div className="text-xs font-medium text-[#FAF7F2]">Realtime Autosave</div>
                <div className="text-[11px] text-[#8F7D8A]">Persist edits to Supabase/Vault after each form keystroke</div>
              </div>
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-[#200A24] transition">
              <div>
                <div className="text-xs font-medium text-[#FAF7F2]">Anniversary Notifications</div>
                <div className="text-[11px] text-[#8F7D8A]">Trigger visual notifications when milestone countdowns reach 0 days</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0 h-4 w-4"
              />
            </label>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#DFBF99]/15">
            <Command className="h-4 w-4 text-[#DFBF99]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
              Admin Hotkeys &amp; Shortcuts
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#DFBF99]/10">
              <span className="text-[#C9B7C3]">Quick Search Across Tables</span>
              <kbd className="rounded border border-[#DFBF99]/30 bg-[#120514] px-2 py-0.5 font-mono text-[10px] text-[#DFBF99]">
                / or Cmd+K
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#DFBF99]/10">
              <span className="text-[#C9B7C3]">Close Modal / Slide-over</span>
              <kbd className="rounded border border-[#DFBF99]/30 bg-[#120514] px-2 py-0.5 font-mono text-[10px] text-[#DFBF99]">
                Esc
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#DFBF99]/10">
              <span className="text-[#C9B7C3]">Save Form / Milestone</span>
              <kbd className="rounded border border-[#DFBF99]/30 bg-[#120514] px-2 py-0.5 font-mono text-[10px] text-[#DFBF99]">
                Cmd+Enter
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#C9B7C3]">Return to Public Story</span>
              <kbd className="rounded border border-[#DFBF99]/30 bg-[#120514] px-2 py-0.5 font-mono text-[10px] text-[#DFBF99]">
                G then H
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
