import React, { useState } from 'react';
import { CoupleProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { vaultStorage } from '../../services/vaultStorage';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Music, 
  ShieldCheck, 
  Download, 
  Upload, 
  RefreshCw, 
  Heart, 
  Database, 
  Lock,
  Check,
  Calendar
} from 'lucide-react';

interface SettingsSectionProps {
  onResetDemoData: () => void;
  onRefreshData: () => void;
  onOpenAdmin?: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  onResetDemoData,
  onRefreshData,
  onOpenAdmin,
}) => {
  const { profile, updateProfile, switchUser, user, isAdmin } = useAuth();
  const { currentTheme, setTheme, currentAudioTrack, setAudioTrack } = useTheme();

  const [partner1Name, setPartner1Name] = useState(profile.name);
  const [partner2Name, setPartner2Name] = useState(profile.partnerName);
  const [anniversaryDate, setAnniversaryDate] = useState(profile.anniversaryDate);
  const [meetingDate, setMeetingDate] = useState(profile.meetingDate);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passcode, setPasscode] = useState(profile.vaultPasscode || '');
  const [passcodeEnabled, setPasscodeEnabled] = useState(!!profile.vaultPasscode);

  const handleProfileSave = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await updateProfile({
      name: partner1Name,
      partnerName: partner2Name,
      anniversaryDate,
      meetingDate,
      vaultPasscode: passcodeEnabled ? passcode : undefined,
    });

    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  } catch (error) {
    console.error('Profile save failed:', error);
    setSaveSuccess(false);
  }
};

  const handleExportVault = async () => {
    try {
      const data = await vaultStorage.exportVaultData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dear-us-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Error exporting vault: ' + err.message);
    }
  };

  const handleImportVault = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        await vaultStorage.importVaultData(content);
        alert('Vault imported successfully!');
        onRefreshData();
      };
      reader.readAsText(file);
    } catch (err: any) {
      alert('Error importing vault: ' + err.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#DFBF99]/15 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99] mb-2.5">
          <SettingsIcon className="h-3.5 w-3.5" />
          <span className="font-sans font-medium tracking-wide">Vault Preferences</span>
        </div>
        <h1 className="editorial-title text-4xl sm:text-5xl font-normal text-[#FAF7F2]">
          Settings & Sacred Keys
        </h1>
        <p className="text-sm text-[#C9B7C3] mt-2 font-sans">
          Personalize names, anniversaries, ambient musical soundscapes, and data backups.
        </p>
      </div>

      {/* 1. Couple Profile Configuration */}
      <div className="rounded-2xl border border-[#DFBF99]/20 bg-[#17091A]/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7D2146]/30 text-[#DFBF99] border border-[#DFBF99]/20">
            <User className="h-4 w-4" />
          </div>
          <h2 className="editorial-title text-2xl font-normal text-[#FAF7F2]">Couple Identities & Dates</h2>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-5 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Partner One Name</label>
              <input
                type="text"
                value={partner1Name}
                onChange={(e) => setPartner1Name(e.target.value)}
                required
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Partner Two Name</label>
              <input
                type="text"
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                required
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">First Meeting Date</label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Official Anniversary Date</label>
              <input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                required
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Passcode Protection */}
          <div className="pt-3 border-t border-[#DFBF99]/15">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-medium text-[#FAF7F2] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#DFBF99]" />
                  <span>Private Vault Passcode</span>
                </label>
                <p className="text-[11px] text-[#A896A4] mt-0.5">Optional PIN code for sensitive letters & memories</p>
              </div>
              <input
                type="checkbox"
                checked={passcodeEnabled}
                onChange={(e) => setPasscodeEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-[#DFBF99]/30 text-[#7D2146] focus:ring-[#DFBF99]"
              />
            </div>

            {passcodeEnabled && (
              <input
                type="password"
                maxLength={6}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter 4-6 digit numeric PIN"
                className="w-48 rounded-xl border border-[#DFBF99]/30 bg-[#250E28]/70 px-3.5 py-2 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none font-mono tracking-widest"
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#DFBF99]/15">
            {saveSuccess ? (
              <span className="flex items-center gap-1.5 text-xs text-[#DFBF99] font-medium">
                <Check className="h-4 w-4" />
                <span>Profile details preserved!</span>
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* 2. Visual Aesthetic & Ambient Theme */}
      <div className="rounded-2xl border border-[#DFBF99]/20 bg-[#17091A]/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7D2146]/30 text-[#DFBF99] border border-[#DFBF99]/20">
            <Palette className="h-4 w-4" />
          </div>
          <h2 className="editorial-title text-2xl font-normal text-[#FAF7F2]">Atmosphere & Aesthetic Palette</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 font-sans">
          {[
            { id: 'plum', name: 'Midnight Plum', desc: 'Deep wine & twilight plum tones' },
            { id: 'blush', name: 'Champagne Rose', desc: 'Soft rosegold & warm ivory tint' },
            { id: 'velvet', name: 'Velvet Noir', desc: 'Obsidian black with subtle crimson' },
          ].map((th) => (
            <div
              key={th.id}
              onClick={() => setTheme(th.id as any)}
              className={`cursor-pointer rounded-xl border p-4 transition ${
                currentTheme === th.id
                  ? 'border-[#DFBF99] bg-[#2E1233] ring-1 ring-[#DFBF99]/40 shadow-sm'
                  : 'border-[#DFBF99]/20 bg-[#250E28]/40 hover:bg-[#250E28] hover:border-[#DFBF99]/35'
              }`}
            >
              <h4 className="font-serif text-lg font-normal text-[#FAF7F2] mb-1">{th.name}</h4>
              <p className="text-[11px] text-[#C9B7C3] leading-relaxed">{th.desc}</p>
            </div>
          ))}
        </div>

        {/* Ambient Soundscapes */}
        <div className="pt-4 border-t border-[#DFBF99]/15 font-sans">
          <label className="text-xs font-medium text-[#FAF7F2] flex items-center gap-1.5 mb-3">
            <Music className="h-3.5 w-3.5 text-[#DFBF99]" />
            <span>Ambient Background Soundscape</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'nocturne', label: 'Nocturne Piano' },
              { id: 'rain', label: 'Midnight Rain' },
              { id: 'breeze', label: 'Evening Breeze' },
              { id: 'silence', label: 'Silent Serenity' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => setAudioTrack(snd.id as any)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                  currentAudioTrack === snd.id
                    ? 'border-[#DFBF99]/50 bg-[#7D2146] text-[#FAF7F2] shadow-sm'
                    : 'border-[#DFBF99]/20 bg-[#250E28]/50 text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Administrative Dashboard Access */}
      <div className="rounded-2xl border border-[#DFBF99]/30 bg-gradient-to-r from-[#280E2B] via-[#1E0B22] to-[#160618] p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7D2146] text-[#DFBF99] border border-[#DFBF99]/40 shadow-inner">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="editorial-title text-2xl font-normal text-[#FAF7F2]">Administrator Dashboard</h2>
                <span className="rounded-full bg-emerald-950/70 border border-emerald-700/50 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  {isAdmin ? 'Admin Authorized' : 'Role Restricted'}
                </span>
              </div>
              <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
                Manage full memory CRUD, letters, capsules, homepage CMS, media library, and database RLS.
              </p>
            </div>
          </div>

          <button
            id="open-admin-dashboard-btn"
            onClick={() => onOpenAdmin?.()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
          >
            <Lock className="h-3.5 w-3.5 text-[#DFBF99]" />
            <span>Launch Admin (/admin)</span>
          </button>
        </div>
      </div>

      {/* 3. Data Sovereignty & Backup Export */}
      <div className="rounded-2xl border border-[#DFBF99]/20 bg-[#17091A]/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7D2146]/30 text-[#DFBF99] border border-[#DFBF99]/20">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h2 className="editorial-title text-2xl font-normal text-[#FAF7F2]">Data Backup & Vault Sync</h2>
            <p className="text-xs text-[#C9B7C3] font-sans">Export and protect your memories forever.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 font-sans">
          <button
            onClick={handleExportVault}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-[#DFBF99]/30 bg-[#250E28]/70 px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#2E1233] hover:border-[#DFBF99]/50 transition"
          >
            <Download className="h-4 w-4 text-[#DFBF99]" />
            <span>Export Full Vault (JSON)</span>
          </button>

          <label className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-[#DFBF99]/20 bg-[#250E28]/60 px-5 py-2.5 text-xs font-medium text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#2E1233] hover:border-[#DFBF99]/40 transition cursor-pointer">
            <Upload className="h-4 w-4 text-[#DFBF99]" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportVault} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset vault back to initial demo memories?')) {
                onResetDemoData();
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-950/20 px-5 py-2.5 text-xs font-medium text-red-300 hover:bg-red-950/40 transition sm:ml-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
