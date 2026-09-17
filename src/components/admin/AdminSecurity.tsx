import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  RotateCcw, 
  KeyRound, 
  AlertTriangle,
  Server
} from 'lucide-react';
import { SUPABASE_SCHEMA_SQL } from '../../services/supabase';

interface AdminSecurityProps {
  isSupabaseLive: boolean;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => Promise<boolean>;
  onResetVault: () => Promise<void>;
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({
  isSupabaseLive,
  onExportBackup,
  onImportBackup,
  onResetVault,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result as string;
      try {
        const success = await onImportBackup(content);
        if (success) {
          setImportStatus('Backup restored successfully into the Vault.');
        } else {
          setImportStatus('Failed to parse backup format. Ensure valid Dear Us JSON.');
        }
      } catch (err) {
        setImportStatus('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Security &amp; Row-Level Protection (RLS)
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Database access control matrix, cryptographic backups, and SQL deployment policies.
          </p>
        </div>

        <button
          onClick={onExportBackup}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          <Download className="h-4 w-4 text-[#DFBF99]" />
          <span>Export Full Vault JSON</span>
        </button>
      </div>

      {/* Connection & Role Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-4">
          <div className="flex items-center gap-2 mb-2 text-[#DFBF99]">
            <Server className="h-4 w-4" />
            <span className="text-xs font-mono uppercase">Database Provider</span>
          </div>
          <div className="text-base font-semibold text-[#FAF7F2]">
            {isSupabaseLive ? 'Supabase PostgreSQL' : 'Encrypted Local Storage'}
          </div>
          <div className="text-[11px] text-[#8F7D8A] mt-1">
            {isSupabaseLive ? 'Cloud persistence with live synchronization' : 'Client-side fallback; zero cloud exposure'}
          </div>
        </div>

        <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-4">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-mono uppercase">RLS Policies</span>
          </div>
          <div className="text-base font-semibold text-[#FAF7F2]">
            Active &amp; Enforced
          </div>
          <div className="text-[11px] text-[#8F7D8A] mt-1">
            `public.is_admin()` verifies app_metadata &amp; profile roles
          </div>
        </div>

        <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-4">
          <div className="flex items-center gap-2 mb-2 text-purple-400">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-mono uppercase">Route Protection</span>
          </div>
          <div className="text-base font-semibold text-[#FAF7F2]">
            /admin Guard Enabled
          </div>
          <div className="text-[11px] text-[#8F7D8A] mt-1">
            Non-admin requests blocked with Access Denied modal
          </div>
        </div>
      </div>

      {/* RLS Policies Table */}
      <div className="rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 p-5 space-y-4 backdrop-blur-sm">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
          Database Row Level Security Policy Matrix
        </h3>

        <div className="space-y-2 text-xs">
          <div className="rounded-lg border border-[#DFBF99]/15 bg-[#1C0A1F]/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[#DFBF99] font-medium">public.memories</span>
              <p className="text-[11px] text-[#8F7D8A]">Public memories readable by authenticated users; private memories only by author or admin role</p>
            </div>
            <span className="rounded bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300 self-start sm:self-center">
              RESTRICTED RLS
            </span>
          </div>

          <div className="rounded-lg border border-[#DFBF99]/15 bg-[#1C0A1F]/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[#DFBF99] font-medium">public.letters</span>
              <p className="text-[11px] text-[#8F7D8A]">Sealed letters require unlock_date &lt;= CURRENT_DATE or admin role override to inspect</p>
            </div>
            <span className="rounded bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300 self-start sm:self-center">
              TIMELOCK RLS
            </span>
          </div>

          <div className="rounded-lg border border-[#DFBF99]/15 bg-[#1C0A1F]/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[#DFBF99] font-medium">public.homepage_cms &amp; special_dates</span>
              <p className="text-[11px] text-[#8F7D8A]">Public readable; write operations strictly require public.is_admin() validation</p>
            </div>
            <span className="rounded bg-purple-950/60 border border-purple-700/40 px-2 py-0.5 text-[10px] font-mono text-purple-300 self-start sm:self-center">
              ADMIN WRITE ONLY
            </span>
          </div>

          <div className="rounded-lg border border-[#DFBF99]/15 bg-[#1C0A1F]/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[#DFBF99] font-medium">public.activity_logs</span>
              <p className="text-[11px] text-[#8F7D8A]">Select and Insert operations restricted entirely to administrators</p>
            </div>
            <span className="rounded bg-rose-950/60 border border-rose-700/40 px-2 py-0.5 text-[10px] font-mono text-rose-300 self-start sm:self-center">
              ADMIN PRIVILEGED
            </span>
          </div>
        </div>
      </div>

      {/* SQL Deployment & Copier */}
      <div className="rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 p-5 space-y-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
              Supabase SQL Schema &amp; Security Rules
            </h3>
            <p className="text-[11px] text-[#8F7D8A]">
              Execute in your Supabase SQL editor to create all 11 tables and RLS functions.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFBF99]/30 bg-[#250D29] px-4 py-2 text-xs font-medium text-[#DFBF99] hover:bg-[#38143C] transition"
          >
            {copiedSql ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy SQL Schema</span>
              </>
            )}
          </button>
        </div>

        <pre className="rounded-xl border border-[#DFBF99]/15 bg-[#0F0411] p-4 text-[11px] font-mono text-[#DFBF99]/90 max-h-48 overflow-y-auto select-all">
          {SUPABASE_SCHEMA_SQL}
        </pre>
      </div>

      {/* Vault Backup & Restore */}
      <div className="rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 p-5 space-y-4 backdrop-blur-sm">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
          Vault Backup &amp; Disaster Recovery
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#DFBF99]/15 bg-[#1C0A1F]/70 p-4 space-y-3">
            <h4 className="text-xs font-medium text-[#FAF7F2]">Import / Restore Vault JSON</h4>
            <p className="text-[11px] text-[#8F7D8A]">
              Upload a previously exported .json archive to restore memories, photos, letters, and countdowns.
            </p>
            <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#DFBF99]/30 bg-[#280E2B] px-4 py-2 text-xs font-medium text-[#DFBF99] hover:bg-[#38143C]">
              <Upload className="h-3.5 w-3.5" />
              <span>Select Vault Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {importStatus && (
              <p className="text-xs text-emerald-300 font-mono">{importStatus}</p>
            )}
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-4 space-y-3">
            <h4 className="text-xs font-medium text-rose-300">Reset Vault to Initial Demo State</h4>
            <p className="text-[11px] text-[#8F7D8A]">
              Restores the default curated memories, Paris milestone photos, and sealed letters for Elena &amp; Julian.
            </p>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-2 text-xs font-medium text-rose-300 hover:bg-rose-900/50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Archive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#1D081F] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/60 text-rose-400 border border-rose-700/40">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal mb-2">
              Reset Vault to Demo Archive?
            </h3>
            <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
              This will overwrite custom modifications with the original romance archive.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="rounded-xl border border-[#DFBF99]/20 bg-[#280E2B] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#38143C]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onResetVault();
                  setIsResetConfirmOpen(false);
                }}
                className="rounded-xl border border-rose-500/50 bg-rose-700 px-5 py-2.5 text-xs font-medium text-white hover:bg-rose-600"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
