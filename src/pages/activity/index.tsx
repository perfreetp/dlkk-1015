import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import ActivityCard from '@/components/ActivityCard';
import EmptyState from '@/components/EmptyState';
import { mockActivities, getOngoingActivities, getEndedActivities } from '@/data/activities';
import { Activity } from '@/types';
import { formatNumber } from '@/utils';
import styles from './index.module.scss';

type TabType = 'ongoing' | 'ended';

const ActivityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [hotCount] = useState(mockActivities.filter((a) => a.isHot && a.status !== 'ended').length);

  const displayActivities = useMemo(() => {
    const list =
      activeTab === 'ongoing' ? getOngoingActivities() : getEndedActivities();
    return activities.filter((a) => list.some((b) => b.id === a.id));
  }, [activeTab, activities]);

  usePullDownRefresh(() => {
    console.log('[ActivityPage] Pull down refresh');
    setTimeout(() => {
      setActivities([...mockActivities]);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    console.log('[ActivityPage] Tab changed:', tab);
  };

  const handleJoin = (id: string) => {
    console.log('[ActivityPage] Join activity:', id);
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== id) return act;
        if (act.status === 'ended' || act.status === 'full') return act;

        if (act.isJoined) {
          Taro.showModal({
            title: '取消报名',
            content: '确定要取消报名这个活动吗？',
            success: (res) => {
              if (res.confirm) {
                setActivities((prev2) =>
                  prev2.map((a) =>
                    a.id === id
                      ? {
                          ...a,
                          isJoined: false,
                          currentParticipants: Math.max(0, a.currentParticipants - 1),
                          status: a.status === 'full' ? 'ongoing' : a.status
                        }
                      : a
                  )
                );
                Taro.showToast({ title: '已取消报名', icon: 'success' });
              }
            }
          });
          return act;
        }

        const newParticipants = act.currentParticipants + 1;
        const isFull = newParticipants >= act.maxParticipants;
        Taro.showToast({ title: '报名成功', icon: 'success' });
        return {
          ...act,
          isJoined: true,
          currentParticipants: newParticipants,
          status: isFull ? 'full' : (act.status as any)
        };
      })
    );
  };

  const handleActivityClick = (id: string) => {
    console.log('[ActivityPage] Activity clicked:', id);
    Taro.showToast({ title: '查看活动详情', icon: 'none' });
  };

  const totalParticipants = activities.reduce((sum, a) => sum + a.currentParticipants, 0);
  const totalActivities = activities.length;

  return (
    <View className={styles.activityPage}>
      <View className={styles.header}>
        <View className={styles.banner}>
          <Text className={styles.bannerTitle}>邻里活动中心</Text>
          <Text className={styles.bannerSubtitle}>丰富社区生活，共建美好家园</Text>
          <View className={styles.bannerStats}>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{totalActivities}</Text>
              <Text className={styles.statLabel}>累计活动</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{formatNumber(totalParticipants)}</Text>
              <Text className={styles.statLabel}>参与人次</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{hotCount}</Text>
              <Text className={styles.statLabel}>热门活动</Text>
            </View>
          </View>
          <Text className={styles.bannerDecoration}>🎉</Text>
        </View>

        <View className={styles.tabBar}>
          <Button
            className={classnames(
              styles.tabItem,
              activeTab === 'ongoing' && styles.tabItemActive
            )}
            onClick={() => handleTabChange('ongoing')}
          >
            进行中
            {hotCount > 0 && <Text className={styles.badgeDot}>{hotCount}</Text>}
          </Button>
          <Button
            className={classnames(styles.tabItem, activeTab === 'ended' && styles.tabItemActive)}
            onClick={() => handleTabChange('ended')}
          >
            已结束
          </Button>
        </View>
      </View>

      <ScrollView scrollY className={styles.activityList}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>
            {activeTab === 'ongoing' ? '可报名活动' : '往期活动回顾'}
          </Text>
          <Text className={styles.listCount}>共 {displayActivities.length} 个</Text>
        </View>

        {displayActivities.length > 0 ? (
          displayActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onJoin={handleJoin}
              onClick={handleActivityClick}
            />
          ))
        ) : (
          <EmptyState
            icon="🎊"
            title="暂无活动"
            description={
              activeTab === 'ongoing'
                ? '暂时没有可报名的活动，敬请期待~'
                : '还没有历史活动记录'
            }
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ActivityPage;
