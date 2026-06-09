import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, Button, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import CommentItem from '@/components/CommentItem';
import EmptyState from '@/components/EmptyState';
import { Comment } from '@/types';
import { getCategoryColor, formatTime, formatNumber, formatDateTime } from '@/utils';
import { useApp } from '@/store/AppContext';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const postId = router.params?.id || 'post_004';
  const {
    user,
    toggleBlacklist,
    getPostById,
    getCommentsByPostId,
    togglePostLike,
    togglePostCollect,
    toggleCommentLike,
    toggleCommentTop,
    addComment,
    filterCommentsByBlacklist,
    addMessage
  } = useApp();

  const [postData, setPostData] = useState(() => getPostById(postId));
  const [commentsData, setCommentsData] = useState(() => filterCommentsByBlacklist(getCommentsByPostId(postId)));
  const [isFollowed, setIsFollowed] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null);

  useEffect(() => {
    setPostData(getPostById(postId));
    setCommentsData(filterCommentsByBlacklist(getCommentsByPostId(postId)));
  }, [postId, getPostById, getCommentsByPostId, filterCommentsByBlacklist]);

  useDidShow(() => {
    setPostData(getPostById(postId));
    setCommentsData(filterCommentsByBlacklist(getCommentsByPostId(postId)));
  });

  const categoryColor = useMemo(() => {
    return postData
      ? getCategoryColor(postData.category)
      : { bg: '#F2F3F5', text: '#4E5969' };
  }, [postData]);

  const topComment = useMemo(() => {
    return commentsData.find((c) => c.isTop);
  }, [commentsData]);

  const normalComments = useMemo(() => {
    return commentsData
      .filter((c) => !c.isTop)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [commentsData]);

  const isOwner = postData?.authorId === user.id;

  const handleLike = () => {
    if (!postData) return;
    togglePostLike(postData.id);
    setPostData(getPostById(postId));
  };

  const handleCollect = () => {
    if (!postData) return;
    togglePostCollect(postData.id);
    setPostData(getPostById(postId));
    Taro.showToast({
      title: postData.isCollected ? '已取消收藏' : '收藏成功',
      icon: 'none'
    });
  };

  const handleFollow = () => {
    console.log('[DetailPage] Follow author:', postData?.authorId);
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
      success: () => {
        Taro.showModal({
          title: '举报提交',
          content: '感谢您的反馈，我们会尽快处理。',
          showCancel: false
        });
      }
    });
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handlePreviewImage = (index: number) => {
    if (!postData) return;
    Taro.previewImage({
      current: postData.images[index],
      urls: postData.images
    });
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
    if (!commentText.trim() || !postData) {
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

    addComment(newComment);

    if (!isOwner) {
      addMessage({
        type: 'reply',
        title: '新回复提醒',
        content: `${user.nickname} 回复了你的帖子「${postData.title.substring(0, 15)}${postData.title.length > 15 ? '...' : ''}」：${commentText.trim().substring(0, 30)}`,
        postId: postId as string,
        postTitle: postData.title,
        fromUserName: user.nickname,
        fromUserAvatar: user.avatar
      });
    }

    if (replyToComment && replyToComment.authorId !== user.id && replyToComment.authorId !== postData.authorId) {
      addMessage({
        type: 'reply',
        title: '新回复提醒',
        content: `${user.nickname} 回复了你的评论：${commentText.trim().substring(0, 30)}`,
        postId: postId as string,
        postTitle: postData.title,
        fromUserName: user.nickname,
        fromUserAvatar: user.avatar
      });
    }

    setCommentsData(filterCommentsByBlacklist(getCommentsByPostId(postId)));
    setPostData(getPostById(postId));
    Taro.showToast({ title: '评论成功', icon: 'success' });
    handleCloseInput();
  };

  const handleLikeComment = (commentId: string) => {
    toggleCommentLike(commentId);
    setCommentsData(filterCommentsByBlacklist(getCommentsByPostId(postId)));
  };

  const handleTopComment = (commentId: string) => {
    if (!postData) return;
    const target = commentsData.find(c => c.id === commentId);
    toggleCommentTop(postData.id, commentId);
    setCommentsData(filterCommentsByBlacklist(getCommentsByPostId(postId)));
    Taro.showToast({
      title: target?.isTop ? '已取消置顶' : '置顶成功',
      icon: 'success'
    });
  };

  const handleBlockAuthor = () => {
    if (!postData) return;
    console.log('[DetailPage] Block author:', postData.authorId);
    Taro.showModal({
      title: '屏蔽用户',
      content: `确定屏蔽「${postData.authorName}」吗？屏蔽后将不再看到该用户的帖子和评论。`,
      success: (res) => {
        if (res.confirm) {
          toggleBlacklist(postData.authorId);
          Taro.showToast({ title: '已加入黑名单', icon: 'success' });
        }
      }
    });
  };

  if (!postData) {
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
                src={postData.authorAvatar}
                mode="aspectFill"
              />
              <View className={styles.authorMeta}>
                <View className={styles.authorNameRow}>
                  <Text className={styles.authorName}>{postData.authorName}</Text>
                  {postData.isOwner && <Text className={styles.ownerTag}>楼主</Text>}
                  {postData.isAnonymous && <Text className={styles.anonTag}>匿名</Text>}
                </View>
                <View className={styles.buildingInfo}>
                  <Text>🏠 {postData.building}</Text>
                  <Text>·</Text>
                  <Text>{formatTime(postData.createdAt)}</Text>
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
              {postData.categoryName}
            </Text>

            <Text className={styles.postTitle}>{postData.title}</Text>

            <Text className={styles.postContent}>{postData.content}</Text>

            {postData.images.length > 0 && (
              <View className={styles.imageList}>
                {postData.images.map((img, idx) => (
                  <View className={styles.postImage} key={idx}>
                    <Image
                      src={img}
                      mode="widthFix"
                      style={{ width: '100%' }}
                      onClick={() => handlePreviewImage(idx)}
                    />
                  </View>
                ))}
              </View>
            )}

            <View className={styles.postMeta}>
              <Text className={styles.metaLeft}>{formatDateTime(postData.createdAt)}</Text>
              <View className={styles.metaRight}>
                <Text className={styles.metaAction}>👁️ {formatNumber(postData.viewCount)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.actionSection}>
          <View
            className={classnames(styles.actionBtn, postData.isLiked && styles.actionActive)}
            onClick={handleLike}
          >
            <Text className={styles.actionIcon}>{postData.isLiked ? '❤️' : '🤍'}</Text>
            <Text className={styles.actionText}>{formatNumber(postData.likeCount)}</Text>
          </View>
          <View
            className={classnames(styles.actionBtn, postData.isCollected && styles.actionActive)}
            onClick={handleCollect}
          >
            <Text className={styles.actionIcon}>{postData.isCollected ? '⭐' : '☆'}</Text>
            <Text className={styles.actionText}>{formatNumber(postData.collectCount)}</Text>
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
              <Text className={styles.commentsCount}>({commentsData.length})</Text>
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
            className={classnames(
              styles.bottomAction,
              postData.isLiked && styles.bottomActionActive
            )}
            onClick={handleLike}
          >
            <Text className={styles.bottomActionIcon}>
              {postData.isLiked ? '❤️' : '🤍'}
            </Text>
            <Text className={styles.bottomActionBadge}>
              {formatNumber(postData.likeCount)}
            </Text>
          </View>
          <View
            className={classnames(
              styles.bottomAction,
              postData.isCollected && styles.bottomActionActive
            )}
            onClick={handleCollect}
          >
            <Text className={styles.bottomActionIcon}>
              {postData.isCollected ? '⭐' : '☆'}
            </Text>
            <Text className={styles.bottomActionBadge}>
              {formatNumber(postData.collectCount)}
            </Text>
          </View>
          <View className={styles.bottomAction} onClick={handleShare}>
            <Text className={styles.bottomActionIcon}>↗️</Text>
            <Text className={classnames(styles.bottomActionBadge, styles.shareActionBadge)}>
              分享
            </Text>
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
