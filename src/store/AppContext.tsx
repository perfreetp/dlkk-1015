import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserInfo, Draft } from '@/types';
import { mockUser } from '@/data/user';

interface AppContextType {
  user: UserInfo;
  updateUser: (user: Partial<UserInfo>) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  drafts: Draft[];
  addDraft: (draft: Draft) => void;
  removeDraft: (id: string) => void;
  blacklist: string[];
  toggleBlacklist: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo>(mockUser);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);

  const updateUser = useCallback((updates: Partial<UserInfo>) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const addDraft = useCallback((draft: Draft) => {
    setDrafts(prev => {
      const exists = prev.findIndex(d => d.id === draft.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = draft;
        return updated;
      }
      return [draft, ...prev];
    });
  }, []);

  const removeDraft = useCallback((id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  }, []);

  const toggleBlacklist = useCallback((userId: string) => {
    setBlacklist(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        unreadCount,
        setUnreadCount,
        drafts,
        addDraft,
        removeDraft,
        blacklist,
        toggleBlacklist
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
