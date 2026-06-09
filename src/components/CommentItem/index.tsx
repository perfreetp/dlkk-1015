import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import classnames from 'classnames';
import { Comment } from '@/types';
import { formatTime } from '@/utils';
import styles from './index.module.scss';

interface CommentItemProps {
  comment: Comment;
  onLike?: (id: string) => void;
  onReply?: (comment: Comment) => void;
  onTop?: (id: string) => void;
  isOwner?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onLike, onReply, onTop, isOwner = false }) => {
  const handleLike = () => {
    if (onLike) onLike(comment.id);
  };

  const handleReply = () => {
    if (onReply) onReply(comment);
  };

  const handleTop = () => {
    if (onTop) onTop(comment.id);
  };

  return (
    <View className={classnames(styles.commentItem, comment.isTop && styles.topComment)}>
      <View className={styles.commentHeader}>
        <Image
          className={styles.avatar}
          src={comment.authorAvatar}
          mode="aspectFill"
          onError={(e) => console.error('[CommentItem] Avatar error:', e)}
        />
        <View className={styles.commentBody}>
          <View className={styles.headerRow}>
            <View className={styles.authorInfo}>
              <Text className={styles.authorName}>{comment.authorName}</Text>
              {comment.isOwner && <Text className={classnames(styles.tag, styles.tagOwner)}>楼主</Text>}
              {comment.isTop && <Text className={classnames(styles.tag, styles.tagTop)}>置顶</Text>}
            </View>
            <Text className={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
          </View>

          {!comment.isAnonymous && (
            <Text className={styles.buildingInfo}>{comment.authorBuilding}</Text>
          )}

          <Text className={styles.commentContent}>
            {comment.replyToName && (
              <Text className={styles.replyTo}>回复 @{comment.replyToName}：</Text>
            )}
            {comment.content}
          </Text>

          <View className={styles.commentFooter}>
            <View className={styles.footerLeft}>
              <View
                className={classnames(styles.actionItem, comment.isLiked && styles.actionItemActive)}
                onClick={handleLike}
              >
                <Text className={styles.actionIcon}>{comment.isLiked ? '❤️' : '🤍'}</Text>
                <Text>{comment.likeCount > 0 ? comment.likeCount : '赞'}</Text>
              </View>
              <Button
                className={classnames(styles.replyButton, styles.actionItem)}
                onClick={handleReply}
              >
                <Text className={styles.actionIcon}>💬</Text>
                <Text>回复</Text>
              </Button>
            </View>
            {isOwner && !comment.isTop && (
              <Button
                className={classnames(styles.replyButton, styles.actionItem)}
                onClick={handleTop}
              >
                <Text>📌 置顶</Text>
              </Button>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default CommentItem;
