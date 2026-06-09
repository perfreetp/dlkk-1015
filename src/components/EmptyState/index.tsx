import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title = '暂无内容',
  description = '这里还是空的，快去发布第一条内容吧~',
  actionText,
  onAction
}) => {
  return (
    <View className={styles.emptyContainer}>
      <Text className={styles.emptyIcon}>{icon}</Text>
      <Text className={styles.emptyTitle}>{title}</Text>
      <Text className={styles.emptyDesc}>{description}</Text>
      {actionText && onAction && (
        <Button className={styles.actionButton} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </View>
  );
};

export default EmptyState;
