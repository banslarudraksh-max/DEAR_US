import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { initialProfile } from '../data/demoData';
import { getSupabaseClient } from '../services/supabase';
import { vaultStorage } from '../services/vaultStorage';

interface AuthContextType {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  } | null;
  profile: UserProfile;
  activePartner: 'partner-1' | 'partner-2';
  role: 'admin' | 'user';
  isAdmin: boolean;
  isSupabaseLive: boolean;
  supabaseSessionUser: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  } | null;
  supabaseAuthLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (email: string, name: string, partnerName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchDemoPartner: (partner: 'partner-1' | 'partner-2') => void;
  switchUser: (partner: 'partner-1' | 'partner-2') => void;
  switchRole: (newRole: 'admin' | 'user') => void;
  verifyAdminPasscode: (code: string) => boolean;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_ROLE_KEY = 'dear_us_admin_role_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [activePartner, setActivePartner] = useState<'partner-1' | 'partner-2'>('partner-1');
  const [role, setRole] = useState<'admin' | 'user'>(() => {
    const saved = localStorage.getItem(ADMIN_ROLE_KEY);
    if (saved === 'admin' || saved === 'user') return saved;
    return (initialProfile.role as 'admin' | 'user') || 'admin';
  });

  const [user, setUser] = useState<{ id: string; email: string; name: string; role: 'admin' | 'user' } | null>({
    id: 'partner-1',
    email: 'elena@dearus.love',
    name: 'Elena',
    role: 'admin',
  });
  const [supabaseSessionUser, setSupabaseSessionUser] = useState<{ id: string; email: string; name: string; role: 'admin' | 'user' } | null>(null);
  const [supabaseAuthLoading, setSupabaseAuthLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // Helper to fetch actual role from public.profiles in Supabase
  const resolveProfileRole = async (userId: string, defaultRole: 'admin' | 'user' = 'user'): Promise<{ role: 'admin' | 'user'; name?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { role: defaultRole };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        const resolvedRole = data.role === 'admin' ? 'admin' : 'user';
        return { role: resolvedRole, name: data.name };
      }
    } catch (err) {
      console.warn('Error fetching role from public.profiles:', err);
    }
    return { role: defaultRole };
  };

  useEffect(() => {
    // Load local/vault profile
    vaultStorage.getProfile().then((p) => {
      setProfile(p);
      const currentRole = role || (p.role as 'admin' | 'user') || 'admin';
      if (activePartner === 'partner-1') {
        setUser({ id: 'partner-1', email: p.email, name: p.name, role: currentRole });
      } else {
        setUser({ id: 'partner-2', email: 'julian@dearus.love', name: p.partnerName, role: currentRole });
      }
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      setIsSupabaseLive(true);
      setSupabaseAuthLoading(true);

      supabase.auth.getSession().then(async ({ data }) => {
        if (data.session?.user) {
          const authUser = data.session.user;
          const { role: profileRole, name: profileName } = await resolveProfileRole(
            authUser.id, 
            authUser.user_metadata?.role === 'admin' ? 'admin' : 'user'
          );
          
          const sessionUserObj = {
            id: authUser.id,
            email: authUser.email || 'admin@dearus.love',
            name: profileName || authUser.user_metadata?.name || 'Administrator',
            role: profileRole,
          };
          setSupabaseSessionUser(sessionUserObj);
          setUser(sessionUserObj);
          setRole(profileRole);
        } else {
          setSupabaseSessionUser(null);
        }
        setSupabaseAuthLoading(false);
      }).catch(() => {
        setSupabaseAuthLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const authUser = session.user;
          const { role: profileRole, name: profileName } = await resolveProfileRole(
            authUser.id,
            authUser.user_metadata?.role === 'admin' ? 'admin' : 'user'
          );

          const sessionUserObj = {
            id: authUser.id,
            email: authUser.email || 'admin@dearus.love',
            name: profileName || authUser.user_metadata?.name || 'Administrator',
            role: profileRole,
          };
          setSupabaseSessionUser(sessionUserObj);
          setUser(sessionUserObj);
          setRole(profileRole);
        } else {
          setSupabaseSessionUser(null);
        }
        setSupabaseAuthLoading(false);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setSupabaseAuthLoading(false);
    }
  }, []);

  const switchRole = (newRole: 'admin' | 'user') => {
    setRole(newRole);
    localStorage.setItem(ADMIN_ROLE_KEY, newRole);
    setUser((prev) => prev ? { ...prev, role: newRole } : null);
  };

  const verifyAdminPasscode = (code: string): boolean => {
    // Check against configured vault passcode or default master code
    const validCodes = [
      profile.vaultPasscode || '1234',
      'dearus2026',
      'admin',
      'love'
    ];
    if (validCodes.includes(code.trim())) {
      switchRole('admin');
      return true;
    }
    return false;
  };

  const switchDemoPartner = (partner: 'partner-1' | 'partner-2') => {
    setActivePartner(partner);
    if (partner === 'partner-1') {
      setUser({
        id: 'partner-1',
        email: profile.email || 'elena@dearus.love',
        name: profile.name || 'Elena',
        role,
      });
    } else {
      setUser({
        id: 'partner-2',
        email: 'julian@dearus.love',
        name: profile.partnerName || 'Julian',
        role,
      });
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        throw new Error(error?.message || 'Invalid email or password.');
      }

      // Check public.profiles role
      const { role: profileRole, name: profileName } = await resolveProfileRole(
        data.user.id,
        data.user.user_metadata?.role === 'admin' ? 'admin' : 'user'
      );

      const sessionUserObj = {
        id: data.user.id,
        email: data.user.email || email,
        name: profileName || data.user.user_metadata?.name || 'Administrator',
        role: profileRole,
      };

      setSupabaseSessionUser(sessionUserObj);
      setUser(sessionUserObj);
      setRole(profileRole);

      if (profileRole !== 'admin') {
        throw new Error('Access Denied: Your account does not have administrator privileges (role: "admin" in public.profiles).');
      }

      return true;
    }

    // Local / demo login fallback when Supabase is not configured
    if (email.toLowerCase().includes('julian')) {
      switchDemoPartner('partner-2');
    } else {
      switchDemoPartner('partner-1');
    }
    switchRole('admin');
    return true;
  };

  const signup = async (email: string, name: string, partnerName: string): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password: 'temporary-password-123',
        options: { data: { name, partner_name: partnerName, role: 'admin' } },
      });
      if (error) return false;
    }
    const updated = { ...profile, email, name, partnerName, role };
    await updateProfile(updated);
    setUser({ id: 'partner-1', email, name, role });
    return true;
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    setSupabaseSessionUser(null);
    setRole('user');
    localStorage.removeItem(ADMIN_ROLE_KEY);
    setUser({ id: 'partner-1', email: profile.email, name: profile.name, role: 'user' });
    setActivePartner('partner-1');
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    await vaultStorage.saveProfile(newProfile);
  };

  // Compute isAdmin:
  // If Supabase is configured and live, require an authenticated supabaseSessionUser with role === 'admin'
  // If in demo/local mode, use the role state
  const isAdmin = isSupabaseLive
    ? Boolean(supabaseSessionUser && supabaseSessionUser.role === 'admin')
    : role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activePartner,
        role,
        isAdmin,
        isSupabaseLive,
        supabaseSessionUser,
        supabaseAuthLoading,
        login,
        signup,
        logout,
        switchDemoPartner,
        switchUser: switchDemoPartner,
        switchRole,
        verifyAdminPasscode,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
