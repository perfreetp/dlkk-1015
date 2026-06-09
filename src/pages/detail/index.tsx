import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import CommentItem from '@/components/CommentItem';
import EmptyState from '@/components/EmptyState';
import { getPostById, getCommentsByPostId } from '@/data/posts';
import { Post, Comment } from '@/types';
import { getCategoryColor, formatTime, formatNumber, formatDateTime } from '@/utils';
import { useApp } from '@/store/AppContext';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const postId = router.params?.id || 'post_004';
  const { user, toggleBlacklist } = useApp();

  const [post, setPost] = useState<Post | undefined>(getPostById(postId));
  const [comments, setComments] = useState<Comment[]>(getCommentsByPostId(postId));
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [isCollected, setIsCollected] = useState(post?.isCollected || false);
  const [likeCount, setLikeCount] = useState(post?.likeCount || 0);
  const [collectCount, setCollectCount] = useState(post?.collectCount || 0);
  const [isFollowed, setIsFollowed] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null);

  const categoryColor = useMemo(() => {
    return post ? getCategoryColor(post.category) : { bg: '#F2F3F5', text: '#4E5969' };
  }, [post]);

  const topComment = useMemo(() => {
    return comments.find((c) => c.isTop);
  }, [comments]);

  const normalComments = useMemo(() => {
    return comments.filter((c) => !c.isTop);
  }, [comments]);

  const isOwner = post?.authorId === user.id;

  const handleLike = () => {
    console.log('[DetailPage] Like post:', postId);
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    Taro.showToast({
      title: newLiked ? '点赞成功' : '已取消点赞',
      icon: 'none'
    });
  };

  const handleCollect = () => {
    console.log('[DetailPage] Collect post:', postId);
    const newCollected = !isCollected;
    setIsCollected(newCollected);
    setCollectCount((prev) => (newCollected ? prev + 1 : Math.max(0, prev - 1)));
    Taro.showToast({
      title: newCollected ? '收藏成功' : '已取消收藏',
      icon: 'none'
    });
  };

  const handleFollow = () => {
    console.log('[DetailPage] Follow author:', post?.authorId);
    setIsFollowed(!isFollowed);
    Taro.showToast({
      title: isFollowed ? '已取消关注' : '关注成功',
      icon: 'none'
    });
  };

  const handleReport = () => {
    console.log('[DetailPage] Report post:', postId);
    Taro.showActionSheet({
      itemList: ['内容违规', '垃圾广告', '虚假信息', '人身攻击', '其他原因'],
      success: (res) => {
        Taro.showModal({
          title: '举报提交',
          content: '感谢您的反馈，我们会尽快处理。',
          showCancel: false
        });
      }
    });
  };

  const handleShare = () => {
    console.log('[DetailPage] Share post:', postId);
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handleOpenInput = (comment?: Comment) => {
    if (comment) {
      setReplyToComment(comment);
    } else {
      setReplyToComment(null);
    }
    setShowInputModal(true);
  };

  const handleCloseInput = () => {
    setShowInputModal(false);
    setCommentText('');
    setReplyToComment(null);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }
    console.log('[DetailPage] Send comment:', commentText, 'replyTo:', replyToComment?.id);

    const newComment: Comment = {
      id: `cmt_${Date.now()}`,
      postId: postId as string,
      content: commentText.trim(),
      authorId: user.id,
      authorName: user.nickname,
      authorAvatar: user.avatar,
      authorBuilding: user.building,
      isOwner: isOwner,
      isAnonymous: false,
      isTop: false,
      likeCount: 0,
      isLiked: false,
      replyTo: replyToComment?.id,
      replyToName: replyToComment?.authorName,
      createdAt: new Date().toISOString()
    };

    setComments((prev) => [...prev, newComment]);
    Taro.showToast({ title: '评论成功', icon: 'success' });
    handleCloseInput();
  };

  const handleLikeComment = (commentId: string) => {
    console.log('[DetailPage] Like comment:', commentId);
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const newLiked = !c.isLiked;
        return {
          ...c,
          isLiked: newLiked,
          likeCount: newLiked ? c.likeCount + 1 : Math.max(0, c.likeCount - 1)
        };
      })
    );
  };

  const handleTopComment = (commentId: string) => {
    console.log('[DetailPage] Top comment:', commentId);
    setComments((prev) =>
      prev.map((c) => ({
        ...c,
        isTop: c.id === commentId ? !c.isTop : false
      }))
    );
    Taro.showToast({ title: '操作成功', icon: 'success' });
  };

  const handleBlockAuthor = () => {
    if (!post) return;
    console.log('[DetailPage] Block author:', post.authorId);
    Taro.showModal({
      title: '屏蔽用户',
      content: `确定屏蔽「${post.authorName}」吗？屏蔽后将不再看到该用户的帖子和评论。`,
      success: (res) => {
        if (res.confirm) {
          toggleBlacklist(post.authorId);
          Taro.showToast({ title: '已加入黑名单', icon: 'success' });
        }
      }
    });
  };

  if (!post) {
    return (
      <View className={styles.detailPage}>
        <EmptyState icon="😔" title="帖子不存在" description="该帖子可能已被删除或不存在" />
      </View>
    );
  }

  return (
    <View className={styles.detailPage}>
      <ScrollView scrollY>
        <View className={styles.contentSection}>
          <View className={styles.postHeader}>
            <View className={styles.authorInfo}>
              <Image
                className={styles.avatar}
                src={post.authorAvatar}
                mode="aspectFill"
                onError={(e) => console.error('[DetailPage] Author avatar error:', e)}
              />
              <View className={styles.authorMeta}>
                <View className={styles.authorNameRow}>
                  <Text className={styles.authorName}>{post.authorName}</Text>
                  {post.isOwner && <Text className={styles.ownerTag}>楼主</Text>}
                </View>
                <View className={styles.buildingInfo}>
                  <Text>🏠 {post.building}</Text>
                  <Text>·</Text>
                  <Text>{formatTime(post.createdAt)}</Text>
                </View>
              </View>
              {!isOwner && (
                <Button
                  className={classnames(styles.followBtn, isFollowed && styles.followedBtn)}
                  onClick={handleFollow}
                >
                  {isFollowed ? '已关注' : '+ 关注'}
                </Button>
              )}
            </View>

            <Text
              className={styles.categoryTag}
              style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }}
            >
              {post.categoryName}
            </Text>

            <Text className={styles.postTitle}>{post.title}</Text>

            <Text className={styles.postContent}>{post.content}</Text>

            {post.images.length > 0 && (
              <View className={styles.imageList}>
                {post.images.map((img, idx) => (
                  <View className={styles.postImage} key={idx}>
                    <Image
                      src={img}
                      mode="widthFix"
                      style={{ width: '100%' }}
                      onError={(e) => console.error('[DetailPage] Post image error:', e)}
                    />
                  </View>
                ))}
              </View>
            )}

            <View className={styles.postMeta}>
              <Text className={styles.metaLeft}>{formatDateTime(post.createdAt)}</Text>
              <View className={styles.metaRight}>
                <Text className={styles.metaAction}>👁️ {formatNumber(post.viewCount)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.actionSection}>
          <View
            className={classnames(styles.actionBtn, isLiked && styles.actionActive)}
            onClick={handleLike}
          >
            <Text className={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
            <Text className={styles.actionText}>{formatNumber(likeCount)}</Text>
          </View>
          <View
            className={classnames(styles.actionBtn, isCollected && styles.actionActive)}
            onClick={handleCollect}
          >
            <Text className={styles.actionIcon}>{isCollected ? '⭐' : '☆'}</Text>
            <Text className={styles.actionText}>{formatNumber(collectCount)}</Text>
          </View>
          <View className={styles.actionBtn} onClick={() => handleOpenInput()}>
            <Text className={styles.actionIcon}>💬</Text>
            <Text className={styles.actionText}>评论</Text>
          </View>
          <View
            className={classnames(styles.actionBtn, styles.reportAction)}
            onClick={!isOwner ? handleBlockAuthor : undefined}
          >
            <Text className={styles.actionIcon}>🚫</Text>
            <Text className={styles.actionText}>{!isOwner ? '屏蔽' : '管理'}</Text>
          </View>
          <View
            className={classnames(styles.actionBtn, styles.reportAction)}
            onClick={handleReport}
          >
            <Text className={styles.actionIcon}>⚠️</Text>
            <Text className={styles.actionText}>举报</Text>
          </View>
        </View>

        <View className={styles.commentsSection}>
          <View className={styles.commentsHeader}>
            <Text className={styles.commentsTitle}>
              全部评论
              <Text className={styles.commentsCount}>({comments.length})</Text>
            </Text>
            <Text className={styles.sortBtn}>时间排序 ↓</Text>
          </View>

          {topComment && (
            <View className={styles.topCommentSection}>
              <Text className={styles.topCommentLabel}>📌 楼主置顶</Text>
              <CommentItem
                comment={topComment}
                onLike={handleLikeComment}
                onReply={(c) => handleOpenInput(c)}
                onTop={isOwner ? handleTopComment : undefined}
                isOwner={isOwner}
              />
            </View>
          )}

          {normalComments.length > 0 ? (
            normalComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={handleLikeComment}
                onReply={(c) => handleOpenInput(c)}
                onTop={isOwner ? handleTopComment : undefined}
                isOwner={isOwner}
              />
            ))
          ) : (
            <EmptyState
              icon="💬"
              title="暂无评论"
              description="快来抢沙发，发表第一条评论吧~"
              actionText="写评论"
              onAction={() => handleOpenInput()}
            />
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomInputBar}>
        <View className={styles.inputWrapper} onClick={() => handleOpenInput()}>
          <Text className={styles.inputPlaceholder}>
            {replyToComment ? `回复 @${replyToComment.authorName}` : '说点什么吧...'}
          </Text>
        </View>
        <View className={styles.bottomActions}>
          <View
            className={classnames(styles.bottomAction, isLiked && styles.bottomActionActive)}
            onClick={handleLike}
          >
            <Text className={styles.bottomActionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
            <Text className={styles.bottomActionBadge}>{formatNumber(likeCount)}</Text>
          </View>
          <View
            className={classnames(styles.bottomAction, isCollected && styles.bottomActionActive)}
            onClick={handleCollect}
          >
            <Text className={styles.bottomActionIcon}>{isCollected ? '⭐' : '☆'}</Text>
            <Text className={styles.bottomActionBadge}>{formatNumber(collectCount)}</Text>
          </View>
          <View className={styles.bottomAction} onClick={handleShare}>
            <Text className={styles.bottomActionIcon}>↗️</Text>
            <Text className={classnames(styles.bottomActionBadge, styles.shareActionBadge)}>分享</Text>
          </View>
        </View>
      </View>

      {showInputModal && (
        <>
          <View className={styles.maskLayer} onClick={handleCloseInput} />
          <View className={classnames(styles.inputModal, styles.inputModalVisible)}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalCancel} onClick={handleCloseInput}>
                取消
              </Text>
              <Text className={styles.modalTitle}>
                {replyToComment ? `回复 @${replyToComment.authorName}` : '发表评论'}
              </Text>
              <Text
                className={classnames(
                  styles.modalSend,
                  !commentText.trim() && styles.modalSendDisabled
                )}
                onClick={handleSendComment}
              >
                发送
              </Text>
            </View>
            <Textarea
              className={styles.modalTextarea}
              placeholder={
                replyToComment
                  ? `回复 @${replyToComment.authorName} 的评论...`
                  : '友善发言，共建和谐社区~'
              }
              value={commentText}
              onInput={(e) => setCommentText(e.detail.value)}
              maxlength={500}
              autoFocus
              autoHeight
            />
            <Text className={styles.modalHint}>
              支持输入 500 字 · 当前 {commentText.length}/500
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

export default DetailPage;
