import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import { useApp as useAppContext } from '@/store/AppContext';
import styles from './index.module.scss';

interface MenuItem {
  icon: string;
  iconBg: string;
  title: string;
  desc?: string;
  badge?: number;
  action?: () => void;
}

const MinePage: React.FC = () => {
  const { user, drafts, blacklist } = useApp();
  const { unreadCount } = useAppContext();

  const authStatusMap = {
    verified: { text: '已认证', icon: '✓' },
    pending: { text: '认证中', icon: '⏳' },
    unverified: { text: '未认证', icon: '!' }
  };

  const authInfo = authStatusMap[user.authStatus];

  const handleEditProfile = () => {
    console.log('[MinePage] Edit profile');
    Taro.showToast({ title: '编辑个人资料', icon: 'none' });
  };

  const handleVerifyAddress = () => {
    console.log('[MinePage] Verify address');
    Taro.showToast({ title: '住址认证', icon: 'none' });
  };

  const myPostsMenu: MenuItem[] = [
    {
      icon: '📝',
      iconBg: styles.iconBg1,
      title: '我的帖子',
      desc: `已发布 ${user.postCount} 条`,
      action: () => Taro.showToast({ title: '查看我的帖子', icon: 'none' })
    },
    {
      icon: '⭐',
      iconBg: styles.iconBg2,
      title: '我的收藏',
      desc: `${user.collectCount} 条收藏`,
      action: () => Taro.showToast({ title: '查看收藏', icon: 'none' })
    },
    {
      icon: '❤️',
      iconBg: styles.iconBg3,
      title: '我的点赞',
      desc: `点赞过 ${user.likeCount} 条`,
      action: () => Taro.showToast({ title: '查看点赞', icon: 'none' })
    },
    {
      icon: '📋',
      iconBg: styles.iconBg4,
      title: '草稿箱',
      desc: drafts.length > 0 ? `${drafts.length} 条草稿` : '暂无草稿',
      badge: drafts.length > 0 ? drafts.length : undefined,
      action: () => Taro.showToast({ title: '查看草稿', icon: 'none' })
    }
  ];

  const settingsMenu: MenuItem[] = [
    {
      icon: '🏠',
      iconBg: styles.iconBg6,
      title: '住址认证',
      desc: `${user.building} ${user.room} · ${authInfo.text}`,
      action: handleVerifyAddress
    },
    {
      icon: '🚫',
      iconBg: styles.iconBg5,
      title: '黑名单',
      desc: blacklist.length > 0 ? `${blacklist.length} 人在黑名单` : '暂无屏蔽',
      action: () => Taro.showToast({ title: '管理黑名单', icon: 'none' })
    },
    {
      icon: '🔔',
      iconBg: styles.iconBg3,
      title: '消息通知',
      desc: unreadCount > 0 ? `${unreadCount} 条未读` : '全部已读',
      badge: unreadCount > 0 ? unreadCount : undefined,
      action: () => Taro.switchTab({ url: '/pages/message/index' })
    },
    {
      icon: '⚙️',
      iconBg: styles.iconBg7,
      title: '设置',
      desc: '隐私、通用、关于',
      action: () => Taro.showToast({ title: '设置', icon: 'none' })
    }
  ];

  const renderMenuGroup = (title: string, items: MenuItem[]) => (
    <View className={styles.menuGroup}>
      <Text className={styles.menuGroupTitle}>{title}</Text>
      {items.map((item, idx) => (
        <View
          key={idx}
          className={styles.menuItem}
          onClick={item.action}
        >
          <View className={`${styles.menuIcon} ${item.iconBg}`}>{item.icon}</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>{item.title}</Text>
            {item.desc && <Text className={styles.menuDesc}>{item.desc}</Text>}
          </View>
          <View className={styles.menuRight}>
            {item.badge && <Text className={styles.badge}>{item.badge}</Text>}
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View className={styles.minePage}>
      <View className={styles.userHeader}>
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={user.avatar}
            mode="aspectFill"
            onError={(e) => console.error('[MinePage] Avatar error:', e)}
          />
          <View className={styles.userMeta}>
            <View className={styles.userNameRow} onClick={handleEditProfile}>
              <Text className={styles.userName}>{user.nickname}</Text>
              <Text className={styles.editIcon}>✏️</Text>
            </View>
            <View className={styles.authBadge}>
              <Text>{authInfo.icon}</Text>
              <Text>{authInfo.text}</Text>
            </View>
            <View className={styles.userDesc}>
              <Text>🏠 {user.building} {user.room}</Text>
              <Text>·</Text>
              <Text>入驻 {user.joinDate}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.statsSection}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user.postCount}</Text>
            <Text className={styles.statLabel}>发布帖子</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user.likeCount}</Text>
            <Text className={styles.statLabel}>获赞</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user.collectCount}</Text>
            <Text className={styles.statLabel}>收藏</Text>
          </View>
        </View>

        <View className={styles.menuSection}>
          {renderMenuGroup('我的内容', myPostsMenu)}
          {renderMenuGroup('设置与管理', settingsMenu)}
        </View>

        <Text className={styles.versionInfo}>邻里社区 v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default MinePage;
