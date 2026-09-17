import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminAccessDenied } from './AdminAccessDenied';
import { AdminLogin } from './AdminLogin';

interface AdminRouteProps {
  children: React.ReactNode;
  onReturnToHome: () => void;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children, onReturnToHome }) => {
  const { 
    isAdmin, 
    role, 
    isSupabaseLive, 
    supabaseSessionUser, 
    supabaseAuthLoading 
  } = useAuth();

  // 1. Loading state: while verifying session or startup auth state, show graceful loader
  // This prevents any flash of the admin dashboard or access denied screen.
  if (isSupabaseLive && supabaseAuthLoading) {
    return (
      <div className="min-h-screen bg-[#110413] text-[#FAF7F2] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-[#DFBF99]/20 border-t-[#DFBF99] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-[#DFBF99] animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1 font-mono">
            <p className="text-xs text-[#DFBF99] tracking-wider uppercase">Dear Us Vault</p>
            <p className="text-[11px] text-[#8F7D8A]">Verifying administrator credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated check (when Supabase is live and no session exists):
  // Render the AdminLogin page at /admin /admin/login
  if (isSupabaseLive && !supabaseSessionUser) {
    return (
      <AdminLogin
        onSuccess={() => {
          // Login handler updates the state inside AuthContext, triggering re-render
        }}
        onReturnToHome={onReturnToHome}
      />
    );
  }

  // 3. Authenticated check, but role is not admin:
  // Render the customized Access Denied screen with option to log out and switch account
  if (!isAdmin && role !== 'admin') {
    return (
      <AdminAccessDenied 
        onReturnToHome={onReturnToHome} 
        onGoToLogin={() => {
          // Redirecting to login after logout
        }}
      />
    );
  }

  // 4. Authorized administrator
  return <>{children}</>;
};
