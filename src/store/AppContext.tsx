import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { UserInfo, Draft, Post, Message, Activity, Comment, ActivityParticipant, PostCategory } from '@/types';
import { mockUser } from '@/data/user';
import { mockPosts, mockComments, getPostsByCategory as _getPostsByCategory } from '@/data/posts';
import { mockMessages } from '@/data/messages';
import { mockActivities } from '@/data/activities';
import { categoryNameMap } from '@/data/categories';

interface AppContextType {
  user: UserInfo;
  updateUser: (updates: Partial<UserInfo>) => void;
  unreadCount: number;
  drafts: Draft[];
  addDraft: (draft: Draft) => void;
  removeDraft: (id: string) => void;
  updateDraft: (id: string, updates: Partial<Draft>) => void;
  blacklist: string[];
  toggleBlacklist: (userId: string) => void;
  removeFromBlacklist: (userId: string) => void;

  posts: Post[];
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  getPostById: (id: string) => Post | undefined;
  togglePostLike: (id: string) => void;
  togglePostCollect: (id: string) => void;
  getMyPosts: () => Post[];
  getHotPosts: () => Post[];
  getPostsByBuilding: (building: string) => Post[];
  getPostsByCategory: (category: string) => Post[];

  comments: Comment[];
  addComment: (comment: Comment) => void;
  getCommentsByPostId: (postId: string) => Comment[];
  toggleCommentLike: (commentId: string) => void;
  toggleCommentTop: (postId: string, commentId: string) => void;

  messages: Message[];
  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;
  markMessagesReadByType: (type: string) => void;
  getUnreadCountByType: (type: string) => number;

  activities: Activity[];
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  joinActivity: (activityId: string) => void;
  leaveActivity: (activityId: string) => void;
  getActivityById: (id: string) => Activity | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo>(mockUser);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);

  const unreadCount = useMemo(() => messages.filter(m => !m.isRead).length, [messages]);

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

  const updateDraft = useCallback((id: string, updates: Partial<Draft>) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
  }, []);

  const toggleBlacklist = useCallback((userId: string) => {
    setBlacklist(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  }, []);

  const removeFromBlacklist = useCallback((userId: string) => {
    setBlacklist(prev => prev.filter(id => id !== userId));
  }, []);

  const addPost = useCallback((post: Post) => {
    setPosts(prev => [post, ...prev]);
    setUser(prev => ({ ...prev, postCount: prev.postCount + 1 }));
  }, []);

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setComments(prev => prev.filter(c => c.postId !== id));
  }, []);

  const getPostById = useCallback((id: string) => {
    return posts.find(p => p.id === id);
  }, [posts]);

  const togglePostLike = useCallback((id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newLiked = !p.isLiked;
      return {
        ...p,
        isLiked: newLiked,
        likeCount: newLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1)
      };
    }));
  }, []);

  const togglePostCollect = useCallback((id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newCollected = !p.isCollected;
      return {
        ...p,
        isCollected: newCollected,
        collectCount: newCollected ? p.collectCount + 1 : Math.max(0, p.collectCount - 1)
      };
    }));
    setUser(prev => ({
      ...prev,
      collectCount: prev.collectCount + (posts.find(p => p.id === id)?.isCollected ? -1 : 1)
    }));
  }, [posts]);

  const getMyPosts = useCallback(() => {
    return posts.filter(p => p.authorId === user.id);
  }, [posts, user.id]);

  const getHotPosts = useCallback(() => {
    return posts.filter(p => p.isHot);
  }, [posts]);

  const getPostsByBuilding = useCallback((building: string) => {
    return posts.filter(p => p.building === building);
  }, [posts]);

  const getPostsByCategory = useCallback((category: string) => {
    if (category === 'all') return posts;
    return posts.filter(p => p.category === category);
  }, [posts]);

  const addComment = useCallback((comment: Comment) => {
    setComments(prev => [...prev, comment]);
    setPosts(prev => prev.map(p =>
      p.id === comment.postId ? { ...p, commentCount: p.commentCount + 1 } : p
    ));
  }, []);

  const getCommentsByPostId = useCallback((postId: string) => {
    return comments.filter(c => c.postId === postId);
  }, [comments]);

  const toggleCommentLike = useCallback((commentId: string) => {
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const newLiked = !c.isLiked;
      return {
        ...c,
        isLiked: newLiked,
        likeCount: newLiked ? c.likeCount + 1 : Math.max(0, c.likeCount - 1)
      };
    }));
  }, []);

  const toggleCommentTop = useCallback((postId: string, commentId: string) => {
    setComments(prev => prev.map(c => {
      if (c.postId !== postId) return c;
      return { ...c, isTop: c.id === commentId ? !c.isTop : false };
    }));
  }, []);

  const markMessageRead = useCallback((id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  }, []);

  const markAllMessagesRead = useCallback(() => {
    setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
  }, []);

  const markMessagesReadByType = useCallback((type: string) => {
    setMessages(prev => prev.map(m =>
      (type === 'all' || m.type === type) ? { ...m, isRead: true } : m
    ));
  }, []);

  const getUnreadCountByType = useCallback((type: string) => {
    if (type === 'all') return messages.filter(m => !m.isRead).length;
    return messages.filter(m => !m.isRead && m.type === type).length;
  }, [messages]);

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const joinActivity = useCallback((activityId: string) => {
    setActivities(prev => prev.map(a => {
      if (a.id !== activityId) return a;
      if (a.isJoined || a.currentParticipants >= a.maxParticipants) return a;
      const newParticipant: ActivityParticipant = {
        id: user.id,
        name: user.nickname,
        avatar: user.avatar,
        building: user.building,
        joinedAt: new Date().toISOString()
      };
      return {
        ...a,
        isJoined: true,
        currentParticipants: a.currentParticipants + 1,
        participants: [...a.participants, newParticipant],
        status: a.currentParticipants + 1 >= a.maxParticipants ? 'full' : a.status
      };
    }));
  }, [user]);

  const leaveActivity = useCallback((activityId: string) => {
    setActivities(prev => prev.map(a => {
      if (a.id !== activityId) return a;
      if (!a.isJoined) return a;
      return {
        ...a,
        isJoined: false,
        currentParticipants: Math.max(0, a.currentParticipants - 1),
        participants: a.participants.filter(p => p.id !== user.id),
        status: a.status === 'full' ? 'ongoing' : a.status
      };
    }));
  }, [user.id]);

  const getActivityById = useCallback((id: string) => {
    return activities.find(a => a.id === id);
  }, [activities]);

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        unreadCount,
        drafts,
        addDraft,
        removeDraft,
        updateDraft,
        blacklist,
        toggleBlacklist,
        removeFromBlacklist,
        posts,
        addPost,
        updatePost,
        deletePost,
        getPostById,
        togglePostLike,
        togglePostCollect,
        getMyPosts,
        getHotPosts,
        getPostsByBuilding,
        getPostsByCategory,
        comments,
        addComment,
        getCommentsByPostId,
        toggleCommentLike,
        toggleCommentTop,
        messages,
        markMessageRead,
        markAllMessagesRead,
        markMessagesReadByType,
        getUnreadCountByType,
        activities,
        updateActivity,
        joinActivity,
        leaveActivity,
        getActivityById
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
