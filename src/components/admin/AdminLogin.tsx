import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onReturnToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onReturnToHome }) => {
  const { login, isSupabaseLive } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your administrator email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const success = await login(email.trim(), password);
      if (success) {
        onSuccess();
      } else {
        setErrorMessage('Invalid credentials or insufficient administrator privileges.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Authentication error. Please check your credentials and try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#110413] text-[#FAF7F2] flex flex-col justify-center items-center px-4 py-12 relative selection:bg-[#7D2146] selection:text-white">
      {/* Subtle glowing ambience */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#7D2146]/15 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Top return link */}
        <div className="mb-6 flex justify-between items-center">
          <button
            type="button"
            onClick={onReturnToHome}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#C9B7C3] hover:text-[#FAF7F2] transition group"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#DFBF99] transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Story</span>
          </button>

          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isSupabaseLive ? 'Supabase Auth Protected' : 'Secure Vault'}</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#DFBF99]/25 bg-gradient-to-b from-[#1C0A1F]/95 via-[#160618]/95 to-[#100312]/98 p-7 sm:p-9 shadow-2xl shadow-black/80 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DFBF99]/35 bg-[#2B0E30]/80 text-[#DFBF99] shadow-inner">
              <ShieldCheck className="h-7 w-7 text-[#DFBF99]" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase text-[#DFBF99] mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Dear Us Vault</span>
            </div>

            <h1 className="editorial-title text-3xl text-[#FAF7F2] font-normal tracking-wide">
              Administrator Access
            </h1>
            <p className="mt-2 text-xs text-[#C9B7C3] font-sans leading-relaxed">
              Sign in with your administrator credentials to curate memories, configure the vault, and manage timelines.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-200 flex items-start gap-2.5"
            >
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMessage}</div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#EADFD5] mb-1.5 font-sans">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/60 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="admin@dearus.love"
                  className="w-full rounded-xl border border-[#DFBF99]/30 bg-[#120414] py-2.5 pl-10 pr-4 text-sm text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none focus:ring-1 focus:ring-[#DFBF99] transition font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#EADFD5] font-sans">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/60 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#DFBF99]/30 bg-[#120414] py-2.5 pl-10 pr-11 text-sm text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none focus:ring-1 focus:ring-[#DFBF99] transition font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#DFBF99]/60 hover:text-[#FAF7F2] transition p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#601735] px-5 py-3 text-xs font-medium text-[#FAF7F2] shadow-lg shadow-black/40 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#DFBF99]" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-[#DFBF99]" />
                    <span>Sign In to Admin Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-5 border-t border-[#DFBF99]/15 text-center">
            <p className="text-[11px] text-[#8F7D8A] font-mono leading-relaxed">
              Protected by Supabase Authentication & Row-Level Security. Admin role verification required.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
