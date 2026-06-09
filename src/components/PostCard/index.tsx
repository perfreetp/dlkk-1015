import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { Post } from '@/types';
import { formatTime, formatNumber, getCategoryColor } from '@/utils';
import styles from './index.module.scss';

interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const categoryColor = getCategoryColor(post.category);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/detail/index?id=${post.id}`
      });
    }
  };

  return (
    <View className={styles.postCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.authorInfo}>
          <Image
            className={styles.avatar}
            src={post.authorAvatar}
            mode="aspectFill"
            onError={(e) => console.error('[PostCard] Avatar load error:', e)}
          />
          <View className={styles.authorMeta}>
            <View className={styles.authorName}>
              <Text>{post.authorName}</Text>
              {post.isOwner && <Text className={styles.ownerTag}>楼主</Text>}
            </View>
            <View className={styles.buildingInfo}>
              <Text>{post.building}</Text>
              <Text style={{ margin: '0 8rpx' }}>·</Text>
              <Text>{formatTime(post.createdAt)}</Text>
            </View>
          </View>
        </View>
        {post.isHot && <Text className={styles.hotBadge}>🔥 热门</Text>}
      </View>

      <View className={styles.categorySection}>
        <Text
          className={styles.categoryTag}
          style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }}
        >
          {post.categoryName}
        </Text>
      </View>

      <View className={styles.cardContent}>
        <Text className={styles.postTitle}>{post.title}</Text>
        <Text className={styles.postText}>{post.content}</Text>

        {post.images.length > 0 && (
          <View className={styles.imageGrid}>
            {post.images.slice(0, 3).map((img, idx) => (
              <View className={styles.imageItem} key={idx}>
                <Image
                  className={styles.postImage}
                  src={img}
                  mode="aspectFill"
                  onError={(e) => console.error('[PostCard] Image load error:', e)}
                />
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.footerLeft}>
          <Text className={styles.timeText}>{formatNumber(post.viewCount)} 浏览</Text>
        </View>
        <View className={styles.footerRight}>
          <View
            className={classnames(styles.actionItem, post.isLiked && styles.actionItemActive)}
            onClick={(e) => {
              e.stopPropagation();
              console.log('[PostCard] Like clicked, postId:', post.id);
            }}
          >
            <Text className={styles.actionIcon}>{post.isLiked ? '❤️' : '🤍'}</Text>
            <Text>{formatNumber(post.likeCount)}</Text>
          </View>
          <View
            className={styles.actionItem}
            onClick={(e) => e.stopPropagation()}
          >
            <Text className={styles.actionIcon}>💬</Text>
            <Text>{formatNumber(post.commentCount)}</Text>
          </View>
          <View
            className={classnames(styles.actionItem, post.isCollected && styles.actionItemActive)}
            onClick={(e) => {
              e.stopPropagation();
              console.log('[PostCard] Collect clicked, postId:', post.id);
            }}
          >
            <Text className={styles.actionIcon}>{post.isCollected ? '⭐' : '☆'}</Text>
            <Text>{formatNumber(post.collectCount)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
