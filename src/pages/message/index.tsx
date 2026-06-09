import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import MessageItem from '@/components/MessageItem';
import EmptyState from '@/components/EmptyState';
import { Message, MessageType } from '@/types';
import { useApp } from '@/store/AppContext';
import styles from './index.module.scss';

type FilterType = 'all' | MessageType;

const typeConfig = [
  { key: 'reply' as const, name: '回复我的', icon: '💬', className: styles.type1 },
  { key: 'like' as const, name: '点赞', icon: '❤️', className: styles.type2 },
  { key: 'system' as const, name: '系统通知', icon: '🔔', className: styles.type3 },
  { key: 'activity' as const, name: '活动提醒', icon: '🎉', className: styles.type4 }
];

const MessagePage: React.FC = () => {
  const {
    messages,
    markMessageRead,
    markAllMessagesRead,
    markMessagesReadByType,
    getUnreadCountByType,
    unreadCount
  } = useApp();

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');

  const displayMessages = useMemo(() => {
    let result = messages;
    if (filterType !== 'all') {
      result = result.filter((m) => m.type === filterType);
    }
    if (typeFilter !== 'all') {
      result = result.filter((m) => m.type === typeFilter);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [messages, filterType, typeFilter]);

  const typeUnreadCounts = useMemo(() => {
    return {
      all: unreadCount,
      reply: getUnreadCountByType('reply'),
      like: getUnreadCountByType('like'),
      system: getUnreadCountByType('system'),
      activity: getUnreadCountByType('activity')
    };
  }, [unreadCount, getUnreadCountByType]);

  const listUnreadCount = useMemo(() => {
    return displayMessages.filter((m) => !m.isRead).length;
  }, [displayMessages]);

  const handleFilterChange = useCallback((type: FilterType) => {
    setFilterType(type);
  }, []);

  const handleTypeClick = useCallback((type: FilterType) => {
    const nextType = typeFilter === type ? 'all' : type;
    setTypeFilter(nextType);
    if (nextType !== 'all' && getUnreadCountByType(type) > 0) {
      Taro.showModal({
        title: '标记已读',
        content: `是否将「${typeConfig.find(t => t.key === type)?.name}」类消息全部标记为已读？`,
        success: (res) => {
          if (res.confirm) {
            markMessagesReadByType(type);
            Taro.showToast({ title: '操作成功', icon: 'success' });
          }
        }
      });
    }
  }, [typeFilter, getUnreadCountByType, markMessagesReadByType]);

  const handleMessageClick = useCallback((message: Message) => {
    console.log('[MessagePage] Message clicked:', message.id);
    if (!message.isRead) {
      markMessageRead(message.id);
    }

    if (message.postId) {
      Taro.navigateTo({ url: `/pages/detail/index?id=${message.postId}` });
    } else if (message.activityId) {
      Taro.switchTab({ url: '/pages/activity/index' });
    } else {
      Taro.showModal({
        title: message.title,
        content: message.content,
        showCancel: false,
        confirmText: '我知道了'
      });
    }
  }, [markMessageRead]);

  const handleReadAll = useCallback(() => {
    console.log('[MessagePage] Mark all as read');
    if (unreadCount === 0) return;
    Taro.showModal({
      title: '全部已读',
      content: `确定将 ${unreadCount} 条未读消息标记为已读吗？`,
      success: (res) => {
        if (res.confirm) {
          markAllMessagesRead();
          Taro.showToast({ title: '已全部标记为已读', icon: 'success' });
        }
      }
    });
  }, [unreadCount, markAllMessagesRead]);

  return (
    <View className={styles.messagePage}>
      <View className={styles.header}>
        <View className={styles.pageHeader}>
          <Text className={styles.pageTitle}>消息通知</Text>
          {unreadCount > 0 && (
            <View className={styles.readAll} onClick={handleReadAll}>
              ✔️ 全部已读（{unreadCount}）
            </View>
          )}
        </View>

        <View className={styles.messageTypes}>
          {typeConfig.map((type) => {
            const count = typeUnreadCounts[type.key];
            return (
              <View
                key={type.key}
                className={classnames(styles.typeItem, typeFilter === type.key && styles.typeActive)}
                onClick={() => handleTypeClick(type.key)}
              >
                <View className={`${styles.typeIcon} ${type.className}`}>
                  {type.icon}
                  {count > 0 && (
                    <Text className={styles.unreadBadge}>
                      {count > 99 ? '99+' : count}
                    </Text>
                  )}
                </View>
                <Text className={styles.typeName}>{type.name}</Text>
                {count > 0 && <Text className={styles.typeCount}>{count}</Text>}
              </View>
            );
          })}
        </View>

        <View className={styles.tabBar}>
          <Button
            className={classnames(
              styles.tabItem,
              filterType === 'all' && styles.tabItemActive
            )}
            onClick={() => handleFilterChange('all')}
          >
            全部消息
          </Button>
          <Button
            className={classnames(
              styles.tabItem,
              filterType === 'system' && styles.tabItemActive
            )}
            onClick={() => handleFilterChange('system')}
          >
            系统消息
          </Button>
          <Button
            className={classnames(
              styles.tabItem,
              filterType === 'reply' && styles.tabItemActive
            )}
            onClick={() => handleFilterChange('reply')}
          >
            互动消息
          </Button>
        </View>
      </View>

      <ScrollView scrollY className={styles.messageList}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>消息列表</Text>
          <Text className={styles.listCount}>
            {displayMessages.length > 0 && listUnreadCount > 0 &&
              `${listUnreadCount} 条未读`}
          </Text>
        </View>

        {displayMessages.length > 0 ? (
          displayMessages.map((message) => (
            <MessageItem key={message.id} message={message} onClick={handleMessageClick} />
          ))
        ) : (
          <EmptyState
            icon="📭"
            title="暂无消息"
            description="这里空空如也，多去社区互动吧~"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default MessagePage;
