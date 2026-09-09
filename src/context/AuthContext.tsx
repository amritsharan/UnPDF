import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UnlockHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  unlockedAt: string;
}

interface AuthContextType {
  user: User | null;
  history: UnlockHistoryItem[];
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => { success: boolean; message?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  recordUnlockedFile: (fileName: string, fileSize: number) => void;
  clearHistory: () => void;
}

const STORAGE_USERS_KEY = 'unpdf_users_db_v1';
const STORAGE_CURRENT_USER_KEY = 'unpdf_active_session_v1';
const STORAGE_HISTORY_PREFIX = 'unpdf_history_';

// Default Demo User
const DEMO_USER: User = {
  id: 'demo-user-id',
  name: 'Alex Rivera',
  email: 'demo@unpdf.app',
  createdAt: new Date().toISOString()
};

const DEMO_PASSWORD = 'password123';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<UnlockHistoryItem[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Initialize stored users DB if empty
  const getStoredUsers = (): Record<string, { user: User; passwordHash: string }> => {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      if (!raw) {
        // Seed demo account
        const initialDB = {
          [DEMO_USER.email.toLowerCase()]: {
            user: DEMO_USER,
            passwordHash: DEMO_PASSWORD
          }
        };
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initialDB));
        return initialDB;
      }
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };

  // Load session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (savedUser) {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
        loadUserHistory(parsedUser.id);
      }
    } catch (e) {
      console.error('Failed to restore user session:', e);
    }
  }, []);

  const loadUserHistory = (userId: string) => {
    try {
      const rawHistory = localStorage.getItem(`${STORAGE_HISTORY_PREFIX}${userId}`);
      if (rawHistory) {
        setHistory(JSON.parse(rawHistory));
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  };

  const saveUserHistory = (userId: string, newHistory: UnlockHistoryItem[]) => {
    try {
      localStorage.setItem(`${STORAGE_HISTORY_PREFIX}${userId}`, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.error('Failed to save unlock history:', e);
    }
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (email: string, password: string) => {
    const usersDB = getStoredUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const account = usersDB[normalizedEmail];
    if (!account) {
      return { success: false, message: 'No account found with this email address.' };
    }

    if (account.passwordHash !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    // Success login
    const authenticatedUser = account.user;
    setUser(authenticatedUser);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(authenticatedUser));
    loadUserHistory(authenticatedUser.id);
    closeAuthModal();
    return { success: true };
  };

  const signup = (name: string, email: string, password: string) => {
    const usersDB = getStoredUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (usersDB[normalizedEmail]) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      createdAt: new Date().toISOString()
    };

    usersDB[normalizedEmail] = {
      user: newUser,
      passwordHash: password
    };

    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(usersDB));
    setUser(newUser);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
    setHistory([]);
    closeAuthModal();
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setHistory([]);
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  };

  const recordUnlockedFile = (fileName: string, fileSize: number) => {
    if (!user) return; // Only save history if logged in

    const newItem: UnlockHistoryItem = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      fileName,
      fileSize,
      unlockedAt: new Date().toISOString()
    };

    const updatedHistory = [newItem, ...history];
    saveUserHistory(user.id, updatedHistory);
  };

  const clearHistory = () => {
    if (!user) return;
    saveUserHistory(user.id, []);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        history,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        recordUnlockedFile,
        clearHistory
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
