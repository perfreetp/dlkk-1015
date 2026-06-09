import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Button, Image } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import ActivityCard from '@/components/ActivityCard';
import EmptyState from '@/components/EmptyState';
import { Activity } from '@/types';
import { formatNumber, formatTime, formatDateTime } from '@/utils';
import { useApp } from '@/store/AppContext';
import styles from './index.module.scss';

type TabType = 'ongoing' | 'ended';

const ActivityPage: React.FC = () => {
  const { activities, joinActivity, leaveActivity } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const hotCount = useMemo(
    () => activities.filter((a) => a.isHot && a.status !== 'ended').length,
    [activities]
  );

  const displayActivities = useMemo(() => {
    if (activeTab === 'ongoing') {
      return activities.filter((a) => a.status !== 'ended');
    }
    return activities.filter((a) => a.status === 'ended');
  }, [activeTab, activities]);

  usePullDownRefresh(() => {
    console.log('[ActivityPage] Pull down refresh');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 600);
  });

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleJoin = useCallback((id: string) => {
    console.log('[ActivityPage] Join activity:', id);
    const activity = activities.find((a) => a.id === id);
    if (!activity) return;

    if (activity.status === 'ended') {
      Taro.showToast({ title: '活动已结束', icon: 'none' });
      return;
    }

    if (activity.isJoined) {
      Taro.showModal({
        title: '取消报名',
        content: '确定要取消报名这个活动吗？',
        success: (res) => {
          if (res.confirm) {
            leaveActivity(id);
            Taro.showToast({ title: '已取消报名', icon: 'success' });
          }
        }
      });
      return;
    }

    if (activity.status === 'full') {
      Taro.showToast({ title: '名额已满', icon: 'none' });
      return;
    }

    joinActivity(id);
    Taro.showToast({ title: '报名成功', icon: 'success' });
  }, [activities, joinActivity, leaveActivity]);

  const handleViewParticipants = useCallback((id: string) => {
    const activity = activities.find((a) => a.id === id);
    if (activity) {
      setSelectedActivity(activity);
      setShowParticipantsModal(true);
    }
  }, [activities]);

  const handleActivityClick = useCallback((id: string) => {
    console.log('[ActivityPage] Activity clicked:', id);
    const activity = activities.find((a) => a.id === id);
    if (activity) {
      setSelectedActivity(activity);
      setShowParticipantsModal(true);
    }
  }, [activities]);

  const totalParticipants = useMemo(
    () => activities.reduce((sum, a) => sum + a.currentParticipants, 0),
    [activities]
  );
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
              onClick={handleViewParticipants}
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

      {showParticipantsModal && selectedActivity && (
        <>
          <View
            className={styles.maskLayer}
            onClick={() => setShowParticipantsModal(false)}
          />
          <View className={classnames(styles.modal, styles.modalVisible)}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>活动详情</Text>
              <Text
                className={styles.modalClose}
                onClick={() => setShowParticipantsModal(false)}
              >
                ✕
              </Text>
            </View>

            <ScrollView scrollY className={styles.modalBody}>
              <Image
                className={styles.modalCover}
                src={selectedActivity.coverImage}
                mode="widthFix"
                style={{ width: '100%' }}
              />
              <Text className={styles.modalActTitle}>{selectedActivity.title}</Text>

              <View className={styles.modalInfo}>
                <View className={styles.modalInfoRow}>
                  <Text className={styles.modalInfoIcon}>🕐</Text>
                  <Text className={styles.modalInfoText}>
                    {formatDateTime(selectedActivity.startTime)} - {formatDateTime(selectedActivity.endTime).split(' ')[1]}
                  </Text>
                </View>
                <View className={styles.modalInfoRow}>
                  <Text className={styles.modalInfoIcon}>📍</Text>
                  <Text className={styles.modalInfoText}>{selectedActivity.location}</Text>
                </View>
                <View className={styles.modalInfoRow}>
                  <Text className={styles.modalInfoIcon}>👥</Text>
                  <Text className={styles.modalInfoText}>
                    {selectedActivity.currentParticipants}/{selectedActivity.maxParticipants} 人报名
                  </Text>
                </View>
                <View className={styles.modalInfoRow}>
                  <Text className={styles.modalInfoIcon}>⏰</Text>
                  <Text className={styles.modalInfoText}>
                    报名截止：{formatDateTime(selectedActivity.signupDeadline)}
                  </Text>
                </View>
              </View>

              <Text className={styles.modalDesc}>{selectedActivity.description}</Text>

              <View className={styles.participantsSection}>
                <View className={styles.participantsHeader}>
                  <Text className={styles.participantsTitle}>
                    报名名单（{selectedActivity.participants.length}人）
                  </Text>
                  <Text className={styles.participantsCount}>
                    剩余 {Math.max(0, selectedActivity.maxParticipants - selectedActivity.currentParticipants)} 名额
                  </Text>
                </View>

                {selectedActivity.participants.length > 0 ? (
                  <View className={styles.participantsList}>
                    {selectedActivity.participants.map((p, idx) => (
                      <View className={styles.participantItem} key={`${p.id}-${idx}`}>
                        <Image
                          className={styles.participantAvatar}
                          src={p.avatar}
                          mode="aspectFill"
                        />
                        <View className={styles.participantInfo}>
                          <Text className={styles.participantName}>{p.name}</Text>
                          <Text className={styles.participantBuilding}>
                            {p.building} · {formatTime(p.joinedAt)}报名
                          </Text>
                        </View>
                        <Text className={styles.participantIndex}>#{idx + 1}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={{ padding: '32rpx 0', textAlign: 'center' }}>
                    <Text style={{ color: '#86909C', fontSize: '28rpx' }}>
                      暂无报名人员
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              {selectedActivity.status === 'ended' ? (
                <Button className={classnames(styles.modalBtn, styles.modalBtnDisabled)}>
                  活动已结束
                </Button>
              ) : selectedActivity.isJoined ? (
                <Button
                  className={classnames(styles.modalBtn, styles.modalBtnJoined)}
                  onClick={() => {
                    handleJoin(selectedActivity.id);
                    setSelectedActivity(
                      activities.find((a) => a.id === selectedActivity.id) || null
                    );
                  }}
                >
                  取消报名
                </Button>
              ) : selectedActivity.status === 'full' ? (
                <Button className={classnames(styles.modalBtn, styles.modalBtnDisabled)}>
                  名额已满
                </Button>
              ) : (
                <Button
                  className={classnames(styles.modalBtn, styles.modalBtnPrimary)}
                  onClick={() => {
                    handleJoin(selectedActivity.id);
                    setTimeout(() => {
                      setSelectedActivity(
                        activities.find((a) => a.id === selectedActivity.id) || null
                      );
                    }, 100);
                  }}
                >
                  立即报名
                </Button>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default ActivityPage;
