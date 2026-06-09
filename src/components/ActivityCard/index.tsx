import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import classnames from 'classnames';
import { Activity } from '@/types';
import { formatDateTime, formatNumber } from '@/utils';
import styles from './index.module.scss';

interface ActivityCardProps {
  activity: Activity;
  onJoin?: (id: string) => void;
  onClick?: (id: string) => void;
}

const statusMap: Record<string, { text: string; className: string }> = {
  upcoming: { text: '报名中', className: styles.statusUpcoming },
  ongoing: { text: '进行中', className: styles.statusOngoing },
  ended: { text: '已结束', className: styles.statusEnded },
  full: { text: '名额已满', className: styles.statusFull }
};

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onJoin, onClick }) => {
  const status = statusMap[activity.status] || statusMap.upcoming;
  const progress = Math.min(100, (activity.currentParticipants / activity.maxParticipants) * 100);

  const handleJoin = (e) => {
    e.stopPropagation();
    if (activity.status === 'ended') return;
    if (activity.isJoined) {
      if (onJoin) onJoin(activity.id);
      return;
    }
    if (activity.status === 'full') return;
    if (onJoin) {
      onJoin(activity.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(activity.id);
    }
  };

  const getButtonClass = () => {
    if (activity.status === 'ended') {
      return styles.buttonDisabled;
    }
    if (activity.isJoined) {
      return styles.buttonJoined;
    }
    if (activity.status === 'full') {
      return styles.buttonDisabled;
    }
    return styles.buttonPrimary;
  };

  const getButtonText = () => {
    if (activity.status === 'ended') return '已结束';
    if (activity.isJoined) return '取消报名';
    if (activity.status === 'full') return '名额已满';
    return '立即报名';
  };

  return (
    <View className={styles.activityCard} onClick={handleCardClick}>
      <View className={styles.coverWrapper}>
        <Image
          className={styles.coverImage}
          src={activity.coverImage}
          mode="aspectFill"
          onError={(e) => console.error('[ActivityCard] Cover image error:', e)}
        />
        <Text className={classnames(styles.statusBadge, status.className)}>{status.text}</Text>
        {activity.isHot && <Text className={styles.hotBadge}>🔥 热门</Text>}
      </View>

      <View className={styles.cardBody}>
        <Text className={styles.activityTitle}>{activity.title}</Text>

        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>🕐</Text>
          <Text className={styles.infoText}>
            {formatDateTime(activity.startTime)} - {formatDateTime(activity.endTime).split(' ')[1]}
          </Text>
        </View>

        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>📍</Text>
          <Text className={styles.infoText}>{activity.location}</Text>
        </View>

        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>👥</Text>
          <Text className={styles.infoText}>主办方：{activity.organizer}</Text>
        </View>

        {activity.tags.length > 0 && (
          <View className={styles.tagList}>
            {activity.tags.map((tag, idx) => (
              <Text className={styles.tagItem} key={idx}>{tag}</Text>
            ))}
          </View>
        )}

        {activity.participants.length > 0 && (
          <View className={styles.participantsSection}>
            <View className={styles.participantAvatars}>
              {activity.participants.slice(0, 4).map((p, idx) => (
                <Image
                  className={styles.participantAvatar}
                  src={p.avatar}
                  key={idx}
                  mode="aspectFill"
                  onError={(e) => console.error('[ActivityCard] Participant avatar error:', e)}
                />
              ))}
            </View>
            <Text className={styles.participantsText}>
              {formatNumber(activity.currentParticipants)}人已报名
            </Text>
          </View>
        )}

        <View className={styles.cardFooter}>
          <View className={styles.progressSection}>
            <View className={styles.progressHeader}>
              <Text>报名进度</Text>
              <Text>
                {activity.currentParticipants}/{activity.maxParticipants}
              </Text>
            </View>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${progress}%` }} />
            </View>
          </View>
          <Button
            className={classnames(styles.joinButton, getButtonClass())}
            onClick={handleJoin}
          >
            {getButtonText()}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ActivityCard;
