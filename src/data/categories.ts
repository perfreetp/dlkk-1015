import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'cat_001',
    key: 'idle',
    name: '闲置转让',
    icon: '🛒',
    description: '二手物品交易',
    count: 128
  },
  {
    id: 'cat_002',
    key: 'carpool',
    name: '拼车出行',
    icon: '🚗',
    description: '上下班顺风车',
    count: 56
  },
  {
    id: 'cat_003',
    key: 'repair',
    name: '报修讨论',
    icon: '🔧',
    description: '物业报修经验分享',
    count: 89
  },
  {
    id: 'cat_004',
    key: 'find',
    name: '寻物启事',
    icon: '🔍',
    description: '失物招领信息',
    count: 34
  },
  {
    id: 'cat_005',
    key: 'help',
    name: '互助求助',
    icon: '🤝',
    description: '邻里互助信息',
    count: 72
  },
  {
    id: 'cat_006',
    key: 'activity',
    name: '社区活动',
    icon: '🎉',
    description: '小区活动通知',
    count: 45
  },
  {
    id: 'cat_007',
    key: 'notice',
    name: '公告通知',
    icon: '📢',
    description: '物业官方通知',
    count: 23
  },
  {
    id: 'cat_008',
    key: 'other',
    name: '其他闲聊',
    icon: '💬',
    description: '生活日常分享',
    count: 156
  }
];

export const categoryNameMap: Record<string, string> = categories.reduce(
  (acc, cat) => ({ ...acc, [cat.key]: cat.name }),
  {}
);
