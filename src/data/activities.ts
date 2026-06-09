import { Activity, ActivityParticipant } from '@/types';

const mockParticipants: ActivityParticipant[] = [
  { id: 'p1', name: '阳光邻里', avatar: 'https://picsum.photos/id/64/200/200', building: '3栋', joinedAt: '2026-06-08T10:00:00Z' },
  { id: 'p2', name: '快乐老王', avatar: 'https://picsum.photos/id/91/200/200', building: '3栋', joinedAt: '2026-06-08T10:30:00Z' },
  { id: 'p3', name: '小花花', avatar: 'https://picsum.photos/id/338/200/200', building: '5栋', joinedAt: '2026-06-08T11:15:00Z' },
  { id: 'p4', name: '邻居小张', avatar: 'https://picsum.photos/id/1027/200/200', building: '1栋', joinedAt: '2026-06-09T09:00:00Z' }
];

export const mockActivities: Activity[] = [
  {
    id: 'act_001',
    title: '端午节包粽子邻里活动',
    description: '端午节即将到来，社区将举办包粽子邻里活动，欢迎各位邻居报名参加！现场提供粽叶、糯米、馅料等材料，专业师傅现场教学。包好的粽子可以带回家品尝，还有精美小礼品赠送哦~',
    coverImage: 'https://picsum.photos/id/292/750/400',
    location: '小区中心广场',
    startTime: '2026-06-12T09:00:00Z',
    endTime: '2026-06-12T12:00:00Z',
    signupDeadline: '2026-06-11T18:00:00Z',
    maxParticipants: 50,
    currentParticipants: 42,
    status: 'ongoing',
    organizer: '社区居委会',
    organizerAvatar: 'https://picsum.photos/id/1/200/200',
    isHot: true,
    isJoined: true,
    participants: mockParticipants,
    tags: ['节日', '亲子', '免费']
  },
  {
    id: 'act_002',
    title: '亲子跳蚤市场招募摊主',
    description: '暑假就要来啦！小区将举办亲子跳蚤市场，小朋友们可以把闲置的玩具、书籍、文具拿来交换或售卖。既锻炼孩子的社交能力，又能物尽其用。每个家庭免费提供一张桌子，请自带小板凳。',
    coverImage: 'https://picsum.photos/id/225/750/400',
    location: '小区东门步行街',
    startTime: '2026-06-22T15:00:00Z',
    endTime: '2026-06-22T19:00:00Z',
    signupDeadline: '2026-06-20T24:00:00Z',
    maxParticipants: 30,
    currentParticipants: 18,
    status: 'upcoming',
    organizer: '业主委员会',
    organizerAvatar: 'https://picsum.photos/id/1/200/200',
    isHot: true,
    isJoined: false,
    participants: mockParticipants.slice(0, 2),
    tags: ['亲子', '公益', '招募']
  },
  {
    id: 'act_003',
    title: '免费健康义诊进社区',
    description: '联合社区医院开展免费健康义诊活动，项目包括：血压测量、血糖检测、骨密度筛查、中医问诊、健康咨询等。65岁以上老人可免费领取钙片一份，数量有限，先到先得。',
    coverImage: 'https://picsum.photos/id/431/750/400',
    location: '社区服务中心二楼',
    startTime: '2026-06-15T08:30:00Z',
    endTime: '2026-06-15T11:30:00Z',
    signupDeadline: '2026-06-14T18:00:00Z',
    maxParticipants: 100,
    currentParticipants: 76,
    status: 'upcoming',
    organizer: '社区卫生服务中心',
    organizerAvatar: 'https://picsum.photos/id/1/200/200',
    isHot: false,
    isJoined: false,
    participants: mockParticipants.slice(1, 4),
    tags: ['健康', '公益', '免费']
  },
  {
    id: 'act_004',
    title: '小区业主篮球友谊赛',
    description: '周末不无聊！小区篮球友谊赛招募队员和拉拉队。只要热爱篮球都可以报名参加，男女不限，水平不限。现场提供运动饮料和水果，冠军队还有神秘奖品！',
    coverImage: 'https://picsum.photos/id/1080/750/400',
    location: '小区室内篮球场',
    startTime: '2026-06-14T14:00:00Z',
    endTime: '2026-06-14T18:00:00Z',
    signupDeadline: '2026-06-13T20:00:00Z',
    maxParticipants: 20,
    currentParticipants: 20,
    status: 'full',
    organizer: '小区文体协会',
    organizerAvatar: 'https://picsum.photos/id/1/200/200',
    isHot: false,
    isJoined: false,
    participants: mockParticipants,
    tags: ['运动', '比赛', '社交']
  },
  {
    id: 'act_005',
    title: '春季摄影作品展回顾',
    description: '感谢各位邻居的积极参与！春季摄影作品展共收到作品86幅，经过专业评委评选，获奖名单已公布。本次活动圆满结束，期待下次与大家相见。',
    coverImage: 'https://picsum.photos/id/1015/750/400',
    location: '小区文化长廊',
    startTime: '2026-05-01T09:00:00Z',
    endTime: '2026-05-07T18:00:00Z',
    signupDeadline: '2026-04-25T24:00:00Z',
    maxParticipants: 200,
    currentParticipants: 156,
    status: 'ended',
    organizer: '社区文化站',
    organizerAvatar: 'https://picsum.photos/id/1/200/200',
    isHot: false,
    isJoined: true,
    participants: mockParticipants.slice(0, 3),
    tags: ['文化', '艺术', '已结束']
  },
  {
    id: 'act_006',
    title: '小区宠物见面会',
    description: '铲屎官们集合啦！小区首届宠物见面会来袭~带上你家毛孩子来交朋友吧！现场设置宠物障碍赛、最佳装扮评选、免费宠物体检等环节。还有宠物零食大礼包赠送哦！',
    coverImage: 'https://picsum.photos/id/237/750/400',
    location: '小区草坪广场',
    startTime: '2026-06-28T15:00:00Z',
    endTime: '2026-06-28T18:00:00Z',
    signupDeadline: '2026-06-26T18:00:00Z',
    maxParticipants: 40,
    currentParticipants: 12,
    status: 'upcoming',
    organizer: '小区爱宠俱乐部',
    organizerAvatar: 'https://picsum.photos/id/1/200/200',
    isHot: false,
    isJoined: false,
    participants: mockParticipants.slice(0, 1),
    tags: ['宠物', '社交', '趣味']
  }
];

export const getActivityById = (id: string): Activity | undefined => {
  return mockActivities.find(a => a.id === id);
};

export const getOngoingActivities = (): Activity[] => {
  return mockActivities.filter(a => a.status === 'upcoming' || a.status === 'ongoing' || a.status === 'full');
};

export const getEndedActivities = (): Activity[] => {
  return mockActivities.filter(a => a.status === 'ended');
};
