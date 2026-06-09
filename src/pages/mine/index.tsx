import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useApp } from '@/store/AppContext';
import { mockNeighbors } from '@/data/user';
import { categoryNameMap } from '@/data/categories';
import { formatDateTime } from '@/utils';
import { Draft } from '@/types';
import styles from './index.module.scss';

interface MenuItem {
  icon: string;
  iconBg: string;
  title: string;
  desc?: string;
  badge?: number;
  action?: () => void;
}

const BUILDINGS = ['1栋', '2栋', '3栋', '4栋', '5栋', '6栋', '7栋', '8栋'];

const MinePage: React.FC = () => {
  const {
    user,
    drafts,
    blacklist,
    unreadCount,
    updateUser,
    getMyPosts,
    deletePost,
    removeDraft,
    removeFromBlacklist,
    addPost,
    getLikedPosts,
    getCollectedPosts,
    togglePostLike,
    togglePostCollect
  } = useApp();

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPostsModal, setShowPostsModal] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCollectsModal, setShowCollectsModal] = useState(false);

  const [newNickname, setNewNickname] = useState(user.nickname);
  const [selectedBuilding, setSelectedBuilding] = useState(user.building);
  const [roomInput, setRoomInput] = useState(user.room);

  useDidShow(() => {
    setNewNickname(user.nickname);
    setSelectedBuilding(user.building);
    setRoomInput(user.room);
  });

  const authStatusMap = {
    verified: { text: '已认证', icon: '✓' },
    pending: { text: '认证中', icon: '⏳' },
    unverified: { text: '未认证', icon: '!' }
  };

  const authInfo = authStatusMap[user.authStatus];
  const myPosts = useMemo(() => getMyPosts(), [getMyPosts]);
  const likedPosts = useMemo(() => getLikedPosts(), [getLikedPosts]);
  const collectedPosts = useMemo(() => getCollectedPosts(), [getCollectedPosts]);

  const handleEditProfile = useCallback(() => {
    setNewNickname(user.nickname);
    setShowNicknameModal(true);
  }, [user.nickname]);

  const handleSaveNickname = useCallback(() => {
    const nickname = newNickname.trim();
    if (!nickname) {
      Taro.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }
    if (nickname.length > 12) {
      Taro.showToast({ title: '昵称不能超过12个字符', icon: 'none' });
      return;
    }
    updateUser({ nickname });
    Taro.showToast({ title: '昵称修改成功', icon: 'success' });
    setShowNicknameModal(false);
  }, [newNickname, updateUser]);

  const handleVerifyAddress = useCallback(() => {
    setSelectedBuilding(user.building);
    setRoomInput(user.room);
    setShowVerifyModal(true);
  }, [user.building, user.room]);

  const handleSubmitVerify = useCallback(() => {
    const room = roomInput.trim();
    if (!room) {
      Taro.showToast({ title: '请输入房间号', icon: 'none' });
      return;
    }
    updateUser({
      building: selectedBuilding,
      room,
      authStatus: 'pending',
      isVerified: false
    });
    Taro.showToast({ title: '认证申请已提交', icon: 'success' });
    setShowVerifyModal(false);
  }, [selectedBuilding, roomInput, updateUser]);

  const handleViewMyPosts = useCallback(() => {
    setShowPostsModal(true);
  }, []);

  const handleViewLiked = useCallback(() => {
    setShowLikesModal(true);
  }, []);

  const handleViewCollected = useCallback(() => {
    setShowCollectsModal(true);
  }, []);

  const handleViewPostDetailFromLikes = useCallback((postId: string) => {
    setShowLikesModal(false);
    Taro.navigateTo({ url: `/pages/detail/index?id=${postId}` });
  }, []);

  const handleViewPostDetailFromCollects = useCallback((postId: string) => {
    setShowCollectsModal(false);
    Taro.navigateTo({ url: `/pages/detail/index?id=${postId}` });
  }, []);

  const handleUnlike = useCallback((postId: string) => {
    togglePostLike(postId);
    Taro.showToast({ title: '已取消点赞', icon: 'none' });
  }, [togglePostLike]);

  const handleUncollect = useCallback((postId: string) => {
    togglePostCollect(postId);
    Taro.showToast({ title: '已取消收藏', icon: 'none' });
  }, [togglePostCollect]);

  const handleViewPostDetail = useCallback((postId: string) => {
    setShowPostsModal(false);
    Taro.navigateTo({ url: `/pages/detail/index?id=${postId}` });
  }, []);

  const handleDeletePost = useCallback((postId: string) => {
    Taro.showModal({
      title: '删除帖子',
      content: '确定要删除这条帖子吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          deletePost(postId);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }, [deletePost]);

  const handleViewDrafts = useCallback(() => {
    setShowDraftsModal(true);
  }, []);

  const handleEditDraft = useCallback((draftId: string) => {
    setShowDraftsModal(false);
    Taro.navigateTo({ url: `/pages/post/index?draftId=${draftId}` });
  }, []);

  const handleDeleteDraft = useCallback((draftId: string) => {
    Taro.showModal({
      title: '删除草稿',
      content: '确定要删除这条草稿吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          removeDraft(draftId);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }, [removeDraft]);

  const handlePublishDraft = useCallback((draft: Draft) => {
    Taro.showModal({
      title: '发布草稿',
      content: '确定要将这条草稿发布出去吗？',
      success: (res) => {
        if (res.confirm) {
          const categoryName = categoryNameMap[draft.category] || '其他闲聊';
          const showLoc = typeof draft.showLocation === 'boolean' ? draft.showLocation : true;
          addPost({
            id: `post_${Date.now()}`,
            title: draft.title || '(无标题)',
            content: draft.content || '',
            category: draft.category,
            categoryName,
            images: draft.images || [],
            isAnonymous: draft.isAnonymous,
            authorId: user.id,
            authorName: draft.isAnonymous ? '匿名邻居' : user.nickname,
            authorAvatar: user.avatar,
            authorBuilding: showLoc ? user.building : '保密',
            building: showLoc ? user.building : '未知',
            createdAt: new Date().toISOString(),
            likeCount: 0,
            commentCount: 0,
            collectCount: 0,
            viewCount: 1,
            isLiked: false,
            isCollected: false,
            isHot: false,
            isOwner: true
          });
          removeDraft(draft.id);
          Taro.showToast({ title: '发布成功', icon: 'success' });
          setTimeout(() => {
            setShowDraftsModal(false);
            Taro.switchTab({ url: '/pages/home/index' });
          }, 800);
        }
      }
    });
  }, [addPost, removeDraft, user]);

  const handleViewBlacklist = useCallback(() => {
    setShowBlacklistModal(true);
  }, []);

  const handleRemoveFromBlacklist = useCallback((userId: string) => {
    Taro.showModal({
      title: '移出黑名单',
      content: '确定要将该用户移出黑名单吗？',
      success: (res) => {
        if (res.confirm) {
          removeFromBlacklist(userId);
          Taro.showToast({ title: '已移出黑名单', icon: 'success' });
        }
      }
    });
  }, [removeFromBlacklist]);

  const blacklistUsers = useMemo(() => {
    return blacklist
      .map(uid => mockNeighbors.find(n => n.id === uid))
      .filter(Boolean);
  }, [blacklist]);

  const myPostsMenu: MenuItem[] = [
    {
      icon: '📝',
      iconBg: styles.iconBg1,
      title: '我的帖子',
      desc: `已发布 ${myPosts.length} 条`,
      action: handleViewMyPosts
    },
    {
      icon: '⭐',
      iconBg: styles.iconBg2,
      title: '我的收藏',
      desc: `${collectedPosts.length} 条收藏`,
      action: handleViewCollected
    },
    {
      icon: '❤️',
      iconBg: styles.iconBg3,
      title: '我的点赞',
      desc: `点赞过 ${likedPosts.length} 条`,
      action: handleViewLiked
    },
    {
      icon: '📋',
      iconBg: styles.iconBg4,
      title: '草稿箱',
      desc: drafts.length > 0 ? `${drafts.length} 条草稿` : '暂无草稿',
      badge: drafts.length > 0 ? drafts.length : undefined,
      action: handleViewDrafts
    }
  ];

  const settingsMenu: MenuItem[] = [
    {
      icon: '🏠',
      iconBg: styles.iconBg6,
      title: '住址认证',
      desc: `${user.building} ${user.room} · ${authInfo.text}`,
      action: handleVerifyAddress
    },
    {
      icon: '🚫',
      iconBg: styles.iconBg5,
      title: '黑名单',
      desc: blacklist.length > 0 ? `${blacklist.length} 人在黑名单` : '暂无屏蔽',
      action: handleViewBlacklist
    },
    {
      icon: '🔔',
      iconBg: styles.iconBg3,
      title: '消息通知',
      desc: unreadCount > 0 ? `${unreadCount} 条未读` : '全部已读',
      badge: unreadCount > 0 ? unreadCount : undefined,
      action: () => Taro.switchTab({ url: '/pages/message/index' })
    },
    {
      icon: '⚙️',
      iconBg: styles.iconBg7,
      title: '设置',
      desc: '隐私、通用、关于',
      action: () => Taro.showToast({ title: '设置', icon: 'none' })
    }
  ];

  const renderMenuGroup = (title: string, items: MenuItem[]) => (
    <View className={styles.menuGroup}>
      <Text className={styles.menuGroupTitle}>{title}</Text>
      {items.map((item, idx) => (
        <View
          key={idx}
          className={styles.menuItem}
          onClick={item.action}
        >
          <View className={`${styles.menuIcon} ${item.iconBg}`}>{item.icon}</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>{item.title}</Text>
            {item.desc && <Text className={styles.menuDesc}>{item.desc}</Text>}
          </View>
          <View className={styles.menuRight}>
            {item.badge && <Text className={styles.badge}>{item.badge}</Text>}
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderNicknameModal = () => (
    <>
      <View className={styles.maskLayer} onClick={() => setShowNicknameModal(false)} />
      <View className={classnames(styles.modal, showNicknameModal && styles.modalVisible)}>
        <View className={styles.modalHeader}>
          <Text className={styles.modalTitle}>编辑昵称</Text>
          <Text className={styles.modalClose} onClick={() => setShowNicknameModal(false)}>✕</Text>
        </View>
        <View className={styles.modalBody}>
          <View className={styles.inputWrapper}>
            <Text className={styles.inputLabel}>昵称</Text>
            <Input
              className={styles.textInput}
              placeholder="请输入昵称（最多12字）"
              value={newNickname}
              maxlength={12}
              onInput={(e) => setNewNickname(e.detail.value)}
            />
          </View>
        </View>
        <View className={styles.modalFooter}>
          <Button
            className={classnames(styles.modalBtn, styles.modalBtnSecondary)}
            onClick={() => setShowNicknameModal(false)}
          >
            取消
          </Button>
          <Button
            className={classnames(styles.modalBtn, styles.modalBtnPrimary)}
            onClick={handleSaveNickname}
          >
            保存
          </Button>
        </View>
      </View>
    </>
  );

  const renderVerifyModal = () => (
    <>
      <View className={styles.maskLayer} onClick={() => setShowVerifyModal(false)} />
      <View className={classnames(styles.modal, showVerifyModal && styles.modalVisible)}>
        <View className={styles.modalHeader}>
          <Text className={styles.modalTitle}>住址认证</Text>
          <Text className={styles.modalClose} onClick={() => setShowVerifyModal(false)}>✕</Text>
        </View>
        <View className={styles.modalBody}>
          <View className={styles.inputWrapper}>
            <Text className={styles.inputLabel}>选择楼栋</Text>
            <View className={styles.buildingOptions}>
              {BUILDINGS.map((b) => (
                <Text
                  key={b}
                  className={classnames(
                    styles.buildingOption,
                    selectedBuilding === b && styles.buildingOptionActive
                  )}
                  onClick={() => setSelectedBuilding(b)}
                >
                  {b}
                </Text>
              ))}
            </View>
          </View>
          <View className={styles.inputWrapper}>
            <Text className={styles.inputLabel}>房间号</Text>
            <Input
              className={styles.textInput}
              placeholder="如 1502"
              value={roomInput}
              maxlength={6}
              onInput={(e) => setRoomInput(e.detail.value)}
            />
          </View>
          <Text style={{ fontSize: '24rpx', color: '#86909C' }}>
            提交后管理员将在24小时内审核，审核通过后即可发布楼栋相关内容
          </Text>
        </View>
        <View className={styles.modalFooter}>
          <Button
            className={classnames(styles.modalBtn, styles.modalBtnSecondary)}
            onClick={() => setShowVerifyModal(false)}
          >
            取消
          </Button>
          <Button
            className={classnames(styles.modalBtn, styles.modalBtnPrimary)}
            onClick={handleSubmitVerify}
          >
            提交认证
          </Button>
        </View>
      </View>
    </>
  );

  const renderPostsModal = () => (
    <>
      <View className={styles.maskLayer} onClick={() => setShowPostsModal(false)} />
      <View className={classnames(styles.modal, showPostsModal && styles.modalVisible)}>
        <View className={styles.modalHeader}>
          <Text className={styles.modalTitle}>我的帖子（{myPosts.length}）</Text>
          <Text className={styles.modalClose} onClick={() => setShowPostsModal(false)}>✕</Text>
        </View>
        <ScrollView scrollY className={styles.modalBody}>
          {myPosts.length > 0 ? (
            myPosts.map((post) => (
              <View className={styles.listItem} key={post.id}>
                {post.images && post.images.length > 0 ? (
                  <Image
                    className={styles.listItemAvatar}
                    src={post.images[0]}
                    mode="aspectFill"
                  />
                ) : (
                  <View className={styles.listItemAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36rpx' }}>
                    📝
                  </View>
                )}
                <View className={styles.listItemContent}>
                  <Text className={styles.listItemTitle}>{post.title || '(无标题)'}</Text>
                  <View className={styles.postMeta}>
                    <Text className={styles.postMetaItem}>{categoryNameMap[post.category] || '其他'}</Text>
                    <Text className={styles.postMetaItem}>❤️ {post.likeCount}</Text>
                    <Text className={styles.postMetaItem}>💬 {post.commentCount}</Text>
                    <Text className={styles.postMetaItem}>{formatDateTime(post.createdAt).split(' ')[0]}</Text>
                  </View>
                </View>
                <View className={styles.listItemActions}>
                  <Button
                    className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                    onClick={() => handleViewPostDetail(post.id)}
                  >
                    查看
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.actionBtnDanger)}
                    onClick={() => handleDeletePost(post.id)}
                  >
                    删除
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <Text className={styles.emptyTip}>还没有发布过帖子，去首页发帖吧~</Text>
          )}
        </ScrollView>
        <View className={styles.modalFooter}>
          <Button
            className={classnames(styles.modalBtn, styles.modalBtnSecondary)}
            onClick={() => setShowPostsModal(false)}
          >
            关闭
          </Button>
        </View>
      </View>
    </>
  );

  const renderDraftsModal = () => (
    <>
      <View className={styles.maskLayer} onClick={() => setShowDraftsModal(false)} />
      <View className={classnames(styles.modal, showDraftsModal && styles.modalVisible)}>
        <View className={styles.modalHeader}>
          <Text className={styles.modalTitle}>草稿箱（{drafts.length}）</Text>
          <Text className={styles.modalClose} onClick={() => setShowDraftsModal(false)}>✕</Text>
        </View>
        <ScrollView scrollY className={styles.modalBody}>
          {drafts.length > 0 ? (
            drafts.map((draft) => (
              <View className={styles.listItem} key={draft.id}>
                {draft.images && draft.images.length > 0 ? (
                  <Image
                    className={styles.listItemAvatar}
                    src={draft.images[0]}
                    mode="aspectFill"
                  />
                ) : (
                  <View className={styles.listItemAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36rpx' }}>
                    📋
                  </View>
                )}
                <View className={styles.listItemContent}>
                  <Text className={styles.listItemTitle}>{draft.title || '(无标题草稿)'}</Text>
                  <View className={styles.postMeta}>
                    <Text className={styles.postMetaItem}>{categoryNameMap[draft.category] || '其他'}</Text>
                    {draft.isAnonymous && <Text className={styles.postMetaItem}>🙈 匿名</Text>}
                    <Text className={styles.postMetaItem}>📝 {formatDateTime(draft.updatedAt || draft.createdAt).split(' ')[0]}</Text>
                  </View>
                </View>
                <View className={styles.listItemActions}>
                  <Button
                    className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                    onClick={() => handleEditDraft(draft.id)}
                  >
                    编辑
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.modalBtnPrimary)}
                    style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)', color: '#FF9500' }}
                    onClick={() => handlePublishDraft(draft)}
                  >
                    发布
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.actionBtnDanger)}
                    onClick={() => handleDeleteDraft(draft.id)}
                  >
                    删除
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <Text className={styles.emptyTip}>暂无草稿，发帖时可以暂存草稿哦~</Text>
          )}
        </ScrollView>
        <View className={styles.modalFooter}>
          <Button
            className={classnames(styles.modalBtn, styles.modalBtnSecondary)}
            onClick={() => setShowDraftsModal(false)}
          >
            关闭
          </Button>
        </View>
      </View>
    </>
  );

  const renderBlacklistModal = () => (
    <>
      <View className={styles.maskLayer} onClick={() => setShowBlacklistModal(false)} />
      <View className={classnames(styles.modal, showBlacklistModal && styles.modalVisible)}>
        <View className={styles.modalHeader}>
          <Text className={styles.modalTitle}>黑名单（{blacklist.length}）</Text>
          <Text className={styles.modalClose} onClick={() => setShowBlacklistModal(false)}>✕</Text>
        </View>
        <ScrollView scrollY className={styles.modalBody}>
          {blacklistUsers.length > 0 ? (
            blacklistUsers.map((u) => (
              <View className={styles.listItem} key={u!.id}>
                <Image
                  className={styles.listItemAvatar}
                  src={u!.avatar}
                  mode="aspectFill"
                />
                <View className={styles.listItemContent}>
                  <Text className={styles.listItemTitle}>{u!.nickname}</Text>
                  <Text className={styles.listItemDesc}>
                    🏠 {u!.building} {u!.room} · 入驻 {u!.joinDate}
                  </Text>
                </View>
                <View className={styles.listItemActions}>
                  <Button
                    className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                    onClick={() => handleRemoveFromBlacklist(u!.id)}
                  >
                    移出
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <Text className={styles.emptyTip}>黑名单为空，没有屏蔽的用户~</Text>
          )}
        </ScrollView>
        <View className={styles.modalFooter}>
          <Button
            className={classnames(styles.modalBtn, styles.modalBtnSecondary)}
            onClick={() => setShowBlacklistModal(false)}
          >
            关闭
          </Button>
        </View>
      </View>
    </>
  );

  const renderLikesModal = () => (
    <>
      <View className={styles.maskLayer} onClick={() => setShowLikesModal(false)} />
      <View className={classnames(styles.modal, showLikesModal && styles.modalVisible)}>
        <View className={styles.modalHeader}>
          <Text className={styles.modalTitle}>我的点赞（{likedPosts.length}）</Text>
          <Text className={styles.modalClose} onClick={() => setShowLikesModal(false)}>✕</Text>
        </View>
        <ScrollView scrollY className={styles.modalBody}>
          {likedPosts.length > 0 ? (
            likedPosts.map((post) => (
              <View className={styles.listItem} key={post.id}>
                {post.images && post.images.length > 0 ? (
                  <Image
                    className={styles.listItemAvatar}
                    src={post.images[0]}
                    mode="aspectFill"
                  />
                ) : (
                  <View className={styles.listItemAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36rpx' }}>
                    ❤️
                  </View>
                )}
                <View className={styles.listItemContent}>
                  <Text className={styles.listItemTitle}>{post.title || '(无标题)'}</Text>
                  <View className={styles.postMeta}>
                    <Text className={styles.postMetaItem}>{categoryNameMap[post.category] || '其他'}</Text>
                    <Text className={styles.postMetaItem}>💬 {post.commentCount}</Text>
                    <Text className={styles.postMetaItem}>{formatDateTime(post.createdAt).split(' ')[0]}</Text>
                  </View>
                </View>
                <View className={styles.listItemActions}>
                  <Button
                    className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                    onClick={() => handleViewPostDetailFromLikes(post.id)}
                  >
                    查看
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.actionBtnDanger)}
                    onClick={() => handleUnlike(post.id)}
                  >
                    取消
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <Text className={styles.emptyTip}>还没有点赞过帖子，去首页逛逛吧~</Text>
          )}
        </ScrollView>
        <View className={styles.modalFooter}>
          <Button
            className={classnames(styles.modalBtn, styles.modalBtnSecondary)}
            onClick={() => setShowLikesModal(false)}
          >
            关闭
          </Button>
        </View>
      </View>
    </>
  );

  const renderCollectsModal = () => (
    <>
      <View className={styles.maskLayer} onClick={() => setShowCollectsModal(false)} />
      <View className={classnames(styles.modal, showCollectsModal && styles.modalVisible)}>
        <View className={styles.modalHeader}>
          <Text className={styles.modalTitle}>我的收藏（{collectedPosts.length}）</Text>
          <Text className={styles.modalClose} onClick={() => setShowCollectsModal(false)}>✕</Text>
        </View>
        <ScrollView scrollY className={styles.modalBody}>
          {collectedPosts.length > 0 ? (
            collectedPosts.map((post) => (
              <View className={styles.listItem} key={post.id}>
                {post.images && post.images.length > 0 ? (
                  <Image
                    className={styles.listItemAvatar}
                    src={post.images[0]}
                    mode="aspectFill"
                  />
                ) : (
                  <View className={styles.listItemAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36rpx' }}>
                    ⭐
                  </View>
                )}
                <View className={styles.listItemContent}>
                  <Text className={styles.listItemTitle}>{post.title || '(无标题)'}</Text>
                  <View className={styles.postMeta}>
                    <Text className={styles.postMetaItem}>{categoryNameMap[post.category] || '其他'}</Text>
                    <Text className={styles.postMetaItem}>💬 {post.commentCount}</Text>
                    <Text className={styles.postMetaItem}>{formatDateTime(post.createdAt).split(' ')[0]}</Text>
                  </View>
                </View>
                <View className={styles.listItemActions}>
                  <Button
                    className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                    onClick={() => handleViewPostDetailFromCollects(post.id)}
                  >
                    查看
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.actionBtnDanger)}
                    onClick={() => handleUncollect(post.id)}
                  >
                    取消
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <Text className={styles.emptyTip}>还没有收藏帖子，看到喜欢的可以收藏哦~</Text>
          )}
        </ScrollView>
        <View className={styles.modalFooter}>
          <Button
            className={classnames(styles.modalBtn, styles.modalBtnSecondary)}
            onClick={() => setShowCollectsModal(false)}
          >
            关闭
          </Button>
        </View>
      </View>
    </>
  );

  return (
    <View className={styles.minePage}>
      <View className={styles.userHeader}>
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={user.avatar}
            mode="aspectFill"
            onError={(e) => console.error('[MinePage] Avatar error:', e)}
          />
          <View className={styles.userMeta}>
            <View className={styles.userNameRow} onClick={handleEditProfile}>
              <Text className={styles.userName}>{user.nickname}</Text>
              <Text className={styles.editIcon}>✏️</Text>
            </View>
            <View className={styles.authBadge}>
              <Text>{authInfo.icon}</Text>
              <Text>{authInfo.text}</Text>
            </View>
            <View className={styles.userDesc}>
              <Text>🏠 {user.building} {user.room}</Text>
              <Text>·</Text>
              <Text>入驻 {user.joinDate}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.statsSection}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{myPosts.length}</Text>
            <Text className={styles.statLabel}>发布帖子</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user.likeCount}</Text>
            <Text className={styles.statLabel}>获赞</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user.collectCount}</Text>
            <Text className={styles.statLabel}>收藏</Text>
          </View>
        </View>

        <View className={styles.menuSection}>
          {renderMenuGroup('我的内容', myPostsMenu)}
          {renderMenuGroup('设置与管理', settingsMenu)}
        </View>

        <Text className={styles.versionInfo}>邻里社区 v1.0.0</Text>
      </ScrollView>

      {showNicknameModal && renderNicknameModal()}
      {showVerifyModal && renderVerifyModal()}
      {showPostsModal && renderPostsModal()}
      {showDraftsModal && renderDraftsModal()}
      {showBlacklistModal && renderBlacklistModal()}
      {showLikesModal && renderLikesModal()}
      {showCollectsModal && renderCollectsModal()}
    </View>
  );
};

export default MinePage;
