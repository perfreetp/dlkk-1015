import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { categories } from '@/data/categories';
import { PostCategory, Post } from '@/types';
import { useApp } from '@/store/AppContext';
import styles from './index.module.scss';

const PostPage: React.FC = () => {
  const router = useRouter();
  const { addPost, addDraft, user, updateDraft, drafts } = useApp();
  const initialCategory = (router.params?.category as PostCategory) || 'idle';
  const editDraftId = router.params?.draftId;

  const [selectedCategory, setSelectedCategory] = useState<PostCategory>(initialCategory);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(true);

  useEffect(() => {
    if (editDraftId) {
      const draft = drafts.find(d => d.id === editDraftId);
      if (draft) {
        setTitle(draft.title);
        setContent(draft.content);
        setSelectedCategory(draft.category);
        setImages(draft.images);
        setIsAnonymous(draft.isAnonymous);
      }
    }
  }, [editDraftId, drafts]);

  const TITLE_MAX = 50;
  const CONTENT_MAX = 500;
  const IMAGE_MAX = 9;

  const handleChooseImage = () => {
    console.log('[PostPage] Choose image, current count:', images.length);
    if (images.length >= IMAGE_MAX) {
      Taro.showToast({ title: `最多上传${IMAGE_MAX}张图片`, icon: 'none' });
      return;
    }
    const remainCount = IMAGE_MAX - images.length;
    Taro.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFilePaths || res.tempFiles?.map(f => f.path) || [];
        setImages((prev) => {
          const combined = [...prev, ...newImages];
          return combined.slice(0, IMAGE_MAX);
        });
        Taro.showToast({ title: `已添加${newImages.length}张图片`, icon: 'success' });
      },
      fail: (err) => {
        console.warn('[PostPage] chooseImage fail:', err);
        const fallbackImages = [
          'https://picsum.photos/id/1062/600/600',
          'https://picsum.photos/id/1074/600/600',
          'https://picsum.photos/id/1084/600/600'
        ];
        const randomImgs = fallbackImages.slice(0, Math.min(remainCount, 3));
        setImages((prev) => [...prev, ...randomImgs].slice(0, IMAGE_MAX));
        Taro.showToast({ title: '已添加示例图片', icon: 'none' });
      }
    });
  };

  const handlePreviewImage = (index: number) => {
    Taro.previewImage({
      current: images[index],
      urls: images
    });
  };

  const handleRemoveImage = (index: number) => {
    Taro.showModal({
      title: '删除图片',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          setImages((prev) => prev.filter((_, i) => i !== index));
        }
      }
    });
  };

  const handleSaveDraft = () => {
    console.log('[PostPage] Save draft');
    if (!title.trim() && !content.trim()) {
      Taro.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }
    if (editDraftId) {
      updateDraft(editDraftId, {
        title,
        content,
        category: selectedCategory,
        images,
        isAnonymous
      });
      Taro.showToast({ title: '草稿已更新', icon: 'success' });
    } else {
      const draft = {
        id: `draft_${Date.now()}`,
        title,
        content,
        category: selectedCategory,
        images,
        isAnonymous,
        updatedAt: new Date().toISOString()
      };
      addDraft(draft);
      Taro.showToast({ title: '已保存到草稿箱', icon: 'success' });
    }
    setTimeout(() => Taro.navigateBack(), 800);
  };

  const handleSubmit = () => {
    console.log('[PostPage] Submit post');
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '发布确认',
      content: '确定要发布这条帖子吗？',
      success: (modalRes) => {
        if (modalRes.confirm) {
          Taro.showLoading({ title: '发布中...' });
          const catInfo = categories.find(c => c.key === selectedCategory);
          const newPost: Post = {
            id: `post_${Date.now()}`,
            title: title.trim(),
            content: content.trim(),
            category: selectedCategory,
            categoryName: catInfo?.name || '其他闲聊',
            images: [...images],
            authorId: user.id,
            authorName: isAnonymous ? '匿名邻居' : user.nickname,
            authorAvatar: user.avatar,
            authorBuilding: showLocation ? user.building : '保密',
            isAnonymous: isAnonymous,
            isOwner: true,
            likeCount: 0,
            commentCount: 0,
            collectCount: 0,
            viewCount: 1,
            isLiked: false,
            isCollected: false,
            createdAt: new Date().toISOString(),
            building: showLocation ? user.building : '未知',
            isHot: false
          };
          setTimeout(() => {
            addPost(newPost);
            if (editDraftId) {
              // 发布后删除对应草稿
            }
            Taro.hideLoading();
            Taro.showToast({ title: '发布成功', icon: 'success' });
            setTimeout(() => {
              Taro.navigateBack();
              Taro.switchTab({ url: '/pages/home/index' });
            }, 800);
          }, 600);
        }
      }
    });
  };

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  return (
    <View className={styles.postPage}>
      <ScrollView scrollY>
        <View className={styles.formSection}>
          <View className={styles.categorySection}>
            <Text className={styles.sectionLabel}>
              选择分类 <Text className={styles.required}>*</Text>
            </Text>
            <View className={styles.categoryGrid}>
              {categories.map((cat) => (
                <View
                  key={cat.id}
                  className={classnames(
                    styles.categoryItem,
                    selectedCategory === cat.key && styles.categoryItemActive
                  )}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  <Text className={styles.categoryIcon}>{cat.icon}</Text>
                  <Text className={styles.categoryName}>{cat.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.titleSection}>
            <Text className={styles.sectionLabel}>
              标题 <Text className={styles.required}>*</Text>
            </Text>
            <Input
              className={styles.titleInput}
              placeholder="请输入帖子标题（吸引更多邻居关注）"
              value={title}
              maxlength={TITLE_MAX}
              onInput={(e) => setTitle(e.detail.value)}
            />
            <Text className={styles.titleCounter}>
              {title.length}/{TITLE_MAX}
            </Text>
          </View>

          <View className={styles.contentSection}>
            <Text className={styles.sectionLabel}>
              详细内容 <Text className={styles.required}>*</Text>
            </Text>
            <Textarea
              className={styles.contentTextarea}
              placeholder="分享你的想法、需求或问题..."
              value={content}
              maxlength={CONTENT_MAX}
              onInput={(e) => setContent(e.detail.value)}
              autoHeight
            />
            <Text className={styles.contentCounter}>
              {content.length}/{CONTENT_MAX}
            </Text>
          </View>

          <View className={styles.imageSection}>
            <Text className={styles.sectionLabel}>图片上传</Text>
            <View className={styles.imageGrid}>
              {images.map((img, idx) => (
                <View className={styles.imageItem} key={idx}>
                  <Image
                    className={styles.imageContent}
                    src={img}
                    mode="aspectFill"
                    onClick={() => handlePreviewImage(idx)}
                    onError={(e) => console.error('[PostPage] Image error:', e)}
                  />
                  <View
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                  >
                    ✕
                  </View>
                </View>
              ))}
              {images.length < IMAGE_MAX && (
                <View className={styles.addImageBtn} onClick={handleChooseImage}>
                  <View className={styles.addImageContent}>
                    <Text className={styles.addIcon}>+</Text>
                    <Text className={styles.addText}>添加图片</Text>
                    <Text className={styles.addHint}>{images.length}/{IMAGE_MAX}</Text>
                  </View>
                </View>
              )}
            </View>
            <Text className={styles.imageCount}>
              已上传 {images.length}/{IMAGE_MAX} 张（点击可预览，点击右上角删除）
            </Text>
          </View>

          <View className={styles.optionsSection}>
            <Text className={styles.sectionLabel}>发布设置</Text>
            <View className={styles.optionItem}>
              <View className={styles.optionLeft}>
                <Text className={styles.optionIcon}>🎭</Text>
                <View>
                  <Text className={styles.optionText}>匿名发布</Text>
                  <Text className={styles.optionDesc}>隐藏昵称和楼栋信息</Text>
                </View>
              </View>
              <View
                className={classnames(styles.switch, isAnonymous && styles.switchActive)}
                onClick={() => setIsAnonymous(!isAnonymous)}
              >
                <View className={styles.switchKnob} />
              </View>
            </View>

            <View className={styles.optionItem}>
              <View className={styles.optionLeft}>
                <Text className={styles.optionIcon}>📍</Text>
                <View>
                  <Text className={styles.optionText}>显示楼栋</Text>
                  <Text className={styles.optionDesc}>让邻居知道你来自哪栋</Text>
                </View>
              </View>
              <View
                className={classnames(styles.switch, showLocation && styles.switchActive)}
                onClick={() => setShowLocation(!showLocation)}
              >
                <View className={styles.switchKnob} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.draftBtn} onClick={handleSaveDraft}>
          {editDraftId ? '更新草稿' : '存草稿'}
        </Button>
        <Button
          className={classnames(
            styles.submitBtn,
            !canSubmit && styles.submitBtnDisabled
          )}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          发布帖子
        </Button>
      </View>
    </View>
  );
};

export default PostPage;
