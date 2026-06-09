import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import MessageItem from '@/components/MessageItem';
import EmptyState from '@/components/EmptyState';
import { mockMessages, getMessagesByType, getUnreadCountByType } from '@/data/messages';
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
  const { setUnreadCount } = useApp();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');

  const displayMessages = useMemo(() => {
    let result = getMessagesByType(filterType);
    if (typeFilter !== 'all') {
      result = result.filter((m) => m.type === typeFilter);
    }
    return messages.filter((m) => result.some((r) => r.id === m.id));
  }, [filterType, typeFilter, messages]);

  const unreadCounts = useMemo(() => {
    return {
      all: getUnreadCountByType('all'),
      reply: getUnreadCountByType('reply'),
      like: getUnreadCountByType('like'),
      system: getUnreadCountByType('system'),
      activity: getUnreadCountByType('activity')
    };
  }, [messages]);

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
    console.log('[MessagePage] Filter changed:', type);
  };

  const handleTypeClick = (type: FilterType) => {
    setTypeFilter(typeFilter === type ? 'all' : type);
    console.log('[MessagePage] Type filter:', type);
  };

  const handleMessageClick = (message: Message) => {
    console.log('[MessagePage] Message clicked:', message.id);
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m))
    );
    setUnreadCount(prev.filter((m) => m.id !== message.id).length);

    if (message.postId) {
      Taro.navigateTo({ url: `/pages/detail/index?id=${message.postId}` });
    } else {
      Taro.showToast({ title: '查看消息详情', icon: 'none' });
    }
  };

  const handleReadAll = () => {
    console.log('[MessagePage] Mark all as read');
    Taro.showModal({
      title: '全部已读',
      content: '确定将所有消息标记为已读吗？',
      success: (res) => {
        if (res.confirm) {
          setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
          setUnreadCount(0);
          Taro.showToast({ title: '已全部标记为已读', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.messagePage}>
      <View className={styles.header}>
        <View className={styles.pageHeader}>
          <Text className={styles.pageTitle}>消息通知</Text>
          {unreadCounts.all > 0 && (
            <View className={styles.readAll} onClick={handleReadAll}>
              ✔️ 全部已读
            </View>
          )}
        </View>

        <View className={styles.messageTypes}>
          {typeConfig.map((type) => (
            <View
              key={type.key}
              className={classnames(styles.typeItem, typeFilter === type.key && styles.typeActive)}
              onClick={() => handleTypeClick(type.key)}
            >
              <View className={`${styles.typeIcon} ${type.className}`}>
                {type.icon}
                {unreadCounts[type.key] > 0 && (
                  <Text className={styles.unreadBadge}>
                    {unreadCounts[type.key] > 99 ? '99+' : unreadCounts[type.key]}
                  </Text>
                )}
              </View>
              <Text className={styles.typeName}>{type.name}</Text>
            </View>
          ))}
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
            {displayMessages.length > 0 &&
              `${displayMessages.filter((m) => !m.isRead).length} 条未读`}
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
