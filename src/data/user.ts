import { UserInfo } from '@/types';

export const mockUser: UserInfo = {
  id: 'user_001',
  nickname: '阳光邻里',
  avatar: 'https://picsum.photos/id/64/200/200',
  building: '3栋',
  room: '1502',
  isVerified: true,
  authStatus: 'verified',
  phone: '138****8888',
  joinDate: '2023-06-15',
  postCount: 28,
  likeCount: 156,
  collectCount: 42
};

export const mockNeighbors: UserInfo[] = [
  {
    id: 'user_002',
    nickname: '快乐老王',
    avatar: 'https://picsum.photos/id/91/200/200',
    building: '3栋',
    room: '1203',
    isVerified: true,
    authStatus: 'verified',
    phone: '139****1234',
    joinDate: '2023-03-20',
    postCount: 45,
    likeCount: 230,
    collectCount: 67
  },
  {
    id: 'user_003',
    nickname: '小花花',
    avatar: 'https://picsum.photos/id/338/200/200',
    building: '5栋',
    room: '801',
    isVerified: true,
    authStatus: 'verified',
    phone: '137****5678',
    joinDate: '2023-08-10',
    postCount: 18,
    likeCount: 95,
    collectCount: 23
  },
  {
    id: 'user_004',
    nickname: '匿名用户',
    avatar: 'https://picsum.photos/id/177/200/200',
    building: '2栋',
    room: '****',
    isVerified: true,
    authStatus: 'verified',
    phone: '136****9999',
    joinDate: '2023-01-05',
    postCount: 12,
    likeCount: 67,
    collectCount: 18
  },
  {
    id: 'user_005',
    nickname: '邻居小张',
    avatar: 'https://picsum.photos/id/1027/200/200',
    building: '1栋',
    room: '2105',
    isVerified: false,
    authStatus: 'pending',
    phone: '135****2222',
    joinDate: '2024-01-12',
    postCount: 5,
    likeCount: 22,
    collectCount: 8
  }
];
