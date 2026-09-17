import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Lock, ArrowLeft, LogOut, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminAccessDeniedProps {
  onReturnToHome: () => void;
  onGoToLogin?: () => void;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({ onReturnToHome, onGoToLogin }) => {
  const { user, profile, role, logout, isSupabaseLive, switchRole, verifyAdminPasscode } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogoutAndLogin = async () => {
    await logout();
    if (onGoToLogin) {
      onGoToLogin();
    } else {
      window.location.href = '/admin/login';
    }
  };

  const handleUnlockDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('Please enter the administrator passcode.');
      return;
    }
    const isValid = verifyAdminPasscode(passcode);
    if (isValid) {
      setSuccessMsg('Administrative access granted. Welcome to the Vault.');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect passcode. Try master code "1234" or "dearus2026".');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg rounded-2xl border border-[#DFBF99]/30 bg-gradient-to-b from-[#1F0D22]/95 via-[#17081A]/95 to-[#120514]/98 p-8 sm:p-10 shadow-2xl shadow-black/60 backdrop-blur-xl text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/40 bg-rose-950/40 text-rose-300 shadow-inner">
          <ShieldAlert className="h-8 w-8 text-rose-300" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/40 px-3 py-1 text-xs font-mono font-medium text-rose-300 mb-4">
          <Lock className="h-3.5 w-3.5" />
          Access Denied: /admin
        </span>

        <h1 className="editorial-title text-3xl sm:text-4xl text-[#FAF7F2] font-normal mb-3">
          Administrator Privileges Required
        </h1>

        <p className="text-sm font-sans text-[#D4C3B7] leading-relaxed max-w-md mx-auto mb-6">
          You are currently signed in, but your account does not have administrator privileges (<span className="font-mono text-xs text-[#DFBF99]">role !== &apos;admin&apos;</span>). Access to the Admin Vault is strictly restricted.
        </p>

        <div className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/60 p-4 mb-6 text-left">
          <div className="flex items-center justify-between text-xs text-[#C9B7C3] mb-1.5">
            <span>Signed In Account:</span>
            <span className="font-semibold text-[#FAF7F2] truncate max-w-[200px]">{user?.email || user?.name || profile.email}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#C9B7C3]">
            <span>Current Role:</span>
            <span className="inline-flex items-center gap-1 rounded bg-rose-900/40 px-2 py-0.5 text-[11px] font-mono font-semibold text-rose-300 border border-rose-700/40">
              {role.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Demo fallback passcode if not Supabase live */}
        {!isSupabaseLive && (
          <form onSubmit={handleUnlockDemo} className="mb-6 text-left border-t border-[#DFBF99]/15 pt-4">
            <label className="block text-xs font-medium text-[#EADFD5] mb-2">
              Enter Admin Vault Passcode (Demo Mode)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/70" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Enter passcode (default: 1234)"
                  className="w-full rounded-xl border border-[#DFBF99]/30 bg-[#160718] py-2.5 pl-10 pr-4 text-sm text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none focus:ring-1 focus:ring-[#DFBF99]"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition"
              >
                Verify
              </button>
            </div>
            {errorMsg && (
              <p className="mt-2 text-xs text-rose-300 font-sans">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="mt-2 text-xs text-emerald-300 font-sans flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                {successMsg}
              </p>
            )}
          </form>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#DFBF99]/15">
          <button
            type="button"
            onClick={handleLogoutAndLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:brightness-110 transition shadow-md"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign In with Another Account</span>
          </button>

          <button
            type="button"
            onClick={onReturnToHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-4 py-2.5 text-xs font-medium text-[#C9B7C3] hover:text-[#FAF7F2] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Archive</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
