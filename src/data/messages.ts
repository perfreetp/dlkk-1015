import { Message } from '@/types';

export const mockMessages: Message[] = [
  {
    id: 'msg_001',
    type: 'reply',
    title: '快乐老王 回复了你的帖子',
    content: '刚在5栋楼下的小花园看到一只金毛，看起来很像，楼主快去看看！',
    isRead: false,
    createdAt: '2026-06-10T07:45:00Z',
    postId: 'post_004',
    postTitle: '寻找金毛犬一只，今天下午在小区走失，急！',
    fromUserName: '快乐老王',
    fromUserAvatar: 'https://picsum.photos/id/91/200/200'
  },
  {
    id: 'msg_002',
    type: 'like',
    title: '小花花 等5人赞了你的帖子',
    content: '关于电梯维修慢的问题，大家有没有好的建议？',
    isRead: false,
    createdAt: '2026-06-10T07:20:00Z',
    postId: 'post_003',
    postTitle: '关于电梯维修慢的问题，大家有没有好的建议？',
    fromUserName: '小花花',
    fromUserAvatar: 'https://picsum.photos/id/338/200/200'
  },
  {
    id: 'msg_003',
    type: 'system',
    title: '【系统通知】住址认证审核通过',
    content: '您提交的住址认证信息已审核通过，现在可以发布带楼栋标识的帖子了。感谢您对社区工作的支持！',
    isRead: true,
    createdAt: '2026-06-09T15:30:00Z'
  },
  {
    id: 'msg_004',
    type: 'activity',
    title: '活动报名成功',
    content: '您已成功报名「端午节包粽子邻里活动」，请于6月12日上午9:00准时到小区中心广场参加。',
    isRead: false,
    createdAt: '2026-06-08T10:15:00Z',
    activityId: 'act_001'
  },
  {
    id: 'msg_005',
    type: 'reply',
    title: '邻居小张 回复了你的评论',
    content: '好的好的，我加你微信了，通过一下~',
    isRead: true,
    createdAt: '2026-06-08T09:45:00Z',
    postId: 'post_001',
    postTitle: '转让九成新儿童自行车，适合5-8岁小朋友',
    fromUserName: '邻居小张',
    fromUserAvatar: 'https://picsum.photos/id/1027/200/200'
  },
  {
    id: 'msg_006',
    type: 'like',
    title: '快乐老王 赞了你的评论',
    content: '深有同感！我们单元上次也坏了4天才修好，物业效率真的太低了。',
    isRead: true,
    createdAt: '2026-06-07T20:10:00Z',
    postId: 'post_003',
    postTitle: '关于电梯维修慢的问题，大家有没有好的建议？',
    fromUserName: '快乐老王',
    fromUserAvatar: 'https://picsum.photos/id/91/200/200'
  },
  {
    id: 'msg_007',
    type: 'system',
    title: '【公告】端午期间停水通知',
    content: '接自来水公司通知，6月12日（周三）上午8:00-下午18:00因市政管道检修，小区将临时停水。请各位邻居提前做好储水准备。',
    isRead: true,
    createdAt: '2026-06-07T10:00:00Z'
  },
  {
    id: 'msg_008',
    type: 'reply',
    title: '匿名邻居 回复了你的帖子',
    content: '我也在车公庙上班，时间刚好能对上，私信你了！',
    isRead: true,
    createdAt: '2026-06-06T18:30:00Z',
    postId: 'post_010',
    postTitle: '晚上回小区有没有顺路的？福田车公庙出发',
    fromUserName: '匿名邻居',
    fromUserAvatar: 'https://picsum.photos/id/177/200/200'
  },
  {
    id: 'msg_009',
    type: 'activity',
    title: '活动即将开始提醒',
    content: '您报名的「免费健康义诊进社区」将于明天（6月15日）上午8:30开始，请按时参加，地点：社区服务中心二楼。',
    isRead: true,
    createdAt: '2026-06-06T09:00:00Z',
    activityId: 'act_003'
  },
  {
    id: 'msg_010',
    type: 'like',
    title: '物业管家 赞了你的帖子',
    content: '【重要通知】小区端午期间停水通知',
    isRead: true,
    createdAt: '2026-06-05T14:20:00Z',
    postId: 'post_006',
    postTitle: '【重要通知】小区端午期间停水通知',
    fromUserName: '物业管家',
    fromUserAvatar: 'https://picsum.photos/id/1/200/200'
  }
];

export const getMessagesByType = (type: string): Message[] => {
  if (type === 'all') return mockMessages;
  return mockMessages.filter(m => m.type === type);
};

export const getUnreadCount = (): number => {
  return mockMessages.filter(m => !m.isRead).length;
};

export const getUnreadCountByType = (type: string): number => {
  if (type === 'all') return getUnreadCount();
  return mockMessages.filter(m => !m.isRead && m.type === type).length;
};
