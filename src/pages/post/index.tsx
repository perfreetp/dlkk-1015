import React, { useState } from 'react';
import { View, Text, Input, Textarea, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { categories } from '@/data/categories';
import { PostCategory } from '@/types';
import { useApp } from '@/store/AppContext';
import styles from './index.module.scss';

const categoryBgMap: Record<string, { active: boolean }> = {};

const PostPage: React.FC = () => {
  const router = useRouter();
  const { addDraft } = useApp();
  const initialCategory = (router.params?.category as PostCategory) || 'idle';

  const [selectedCategory, setSelectedCategory] = useState<PostCategory>(initialCategory);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(true);

  const TITLE_MAX = 50;
  const CONTENT_MAX = 500;
  const IMAGE_MAX = 9;

  const imageOptions = [
    'https://picsum.photos/id/1018/600/600',
    'https://picsum.photos/id/1036/600/600',
    'https://picsum.photos/id/1039/600/600',
    'https://picsum.photos/id/1044/600/600'
  ];

  const handleChooseImage = () => {
    console.log('[PostPage] Choose image, current count:', images.length);
    if (images.length >= IMAGE_MAX) {
      Taro.showToast({ title: `最多上传${IMAGE_MAX}张图片`, icon: 'none' });
      return;
    }
    const randomImg = imageOptions[Math.floor(Math.random() * imageOptions.length)];
    setImages((prev) => [...prev, randomImg]);
    Taro.showToast({ title: '已添加图片', icon: 'success' });
  };

  const handleRemoveImage = (index: number) => {
    console.log('[PostPage] Remove image at index:', index);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    console.log('[PostPage] Save draft');
    if (!title.trim() && !content.trim()) {
      Taro.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }
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
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '发布中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '发布成功', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 800);
          }, 1000);
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
                    selectedCategory === cat.key && styles.categoryItemActive,
                    categoryBgMap[cat.key]?.active && ''
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
                    onError={(e) => console.error('[PostPage] Image error:', e)}
                  />
                  <View
                    className={styles.removeBtn}
                    onClick={() => handleRemoveImage(idx)}
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
                  </View>
                </View>
              )}
            </View>
            <Text className={styles.imageCount}>
              已上传 {images.length}/{IMAGE_MAX} 张
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
          存草稿
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
