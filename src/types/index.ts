export type PostCategory = 'idle' | 'carpool' | 'repair' | 'find' | 'help' | 'activity' | 'notice' | 'other';

export interface Category {
  id: string;
  key: PostCategory;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  building: string;
  room: string;
  isVerified: boolean;
  authStatus: 'verified' | 'pending' | 'unverified';
  phone: string;
  joinDate: string;
  postCount: number;
  likeCount: number;
  collectCount: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  categoryName: string;
  images: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBuilding: string;
  isAnonymous: boolean;
  isOwner: boolean;
  likeCount: number;
  commentCount: number;
  collectCount: number;
  viewCount: number;
  isLiked: boolean;
  isCollected: boolean;
  createdAt: string;
  building: string;
  isHot: boolean;
  topCommentId?: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBuilding: string;
  isOwner: boolean;
  isAnonymous: boolean;
  isTop: boolean;
  likeCount: number;
  isLiked: boolean;
  replyTo?: string;
  replyToName?: string;
  createdAt: string;
  replies?: Comment[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  location: string;
  startTime: string;
  endTime: string;
  signupDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'ended' | 'full';
  organizer: string;
  organizerAvatar: string;
  isHot: boolean;
  isJoined: boolean;
  participants: ActivityParticipant[];
  tags: string[];
}

export interface ActivityParticipant {
  id: string;
  name: string;
  avatar: string;
  building: string;
  joinedAt: string;
}

export type MessageType = 'reply' | 'like' | 'system' | 'activity';

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  postId?: string;
  postTitle?: string;
  activityId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  images: string[];
  isAnonymous: boolean;
  showLocation: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface BlacklistItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  reason: string;
  addedAt: string;
}
