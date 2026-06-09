import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import { Message } from '@/types';
import { formatTime } from '@/utils';
import styles from './index.module.scss';

interface MessageItemProps {
  message: Message;
  onClick?: (message: Message) => void;
}

const typeIconMap: Record<string, { icon: string; className: string }> = {
  reply: { icon: '💬', className: styles.typeReply },
  like: { icon: '❤️', className: styles.typeLike },
  system: { icon: '🔔', className: styles.typeSystem },
  activity: { icon: '🎉', className: styles.typeActivity }
};

const MessageItem: React.FC<MessageItemProps> = ({ message, onClick }) => {
  const typeInfo = typeIconMap[message.type] || typeIconMap.system;
  const systemAvatar = 'https://picsum.photos/id/1/200/200';

  const handleClick = () => {
    if (onClick) onClick(message);
  };

  return (
    <View className={styles.messageItem} onClick={handleClick}>
      {!message.isRead && <View className={styles.unreadDot} />}
      <View className={styles.avatarWrapper}>
        <Image
          className={styles.avatar}
          src={message.fromUserAvatar || systemAvatar}
          mode="aspectFill"
          onError={(e) => console.error('[MessageItem] Avatar error:', e)}
        />
        <Text className={classnames(styles.typeIcon, typeInfo.className)}>
          {typeInfo.icon}
        </Text>
      </View>
      <View className={styles.messageContent}>
        <View className={styles.messageHeader}>
          <Text className={classnames(styles.messageTitle, message.isRead && styles.isRead)}>
            {message.title}
          </Text>
          <Text className={styles.messageTime}>{formatTime(message.createdAt)}</Text>
        </View>
        <Text className={styles.messagePreview}>{message.content}</Text>
        {message.postTitle && (
          <View className={styles.referencePost}>
            《{message.postTitle}》
          </View>
        )}
      </View>
    </View>
  );
};

export default MessageItem;
