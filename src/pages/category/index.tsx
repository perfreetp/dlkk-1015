import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { categories } from '@/data/categories';
import { getPostsByCategory } from '@/data/posts';
import PostCard from '@/components/PostCard';
import { Category } from '@/types';
import styles from './index.module.scss';

const bgClasses = [
  styles.categoryBg1,
  styles.categoryBg2,
  styles.categoryBg3,
  styles.categoryBg4,
  styles.categoryBg5,
  styles.categoryBg6,
  styles.categoryBg7,
  styles.categoryBg8
];

const CategoryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const categoryPosts = useMemo(() => {
    if (!selectedCategory) return [];
    return getPostsByCategory(selectedCategory.key).slice(0, 3);
  }, [selectedCategory]);

  const handleCategoryClick = (category: Category) => {
    console.log('[CategoryPage] Category clicked:', category.key);
    setSelectedCategory(category);
  };

  const handleViewPosts = (category: Category) => {
    console.log('[CategoryPage] View posts for:', category.key);
    Taro.showToast({ title: `查看${category.name}`, icon: 'none' });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  return (
    <View className={styles.categoryPage}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>分类频道</Text>
        <Text className={styles.pageSubtitle}>
          {selectedCategory
            ? `正在浏览「${selectedCategory.name}」分类`
            : '发现感兴趣的邻里话题'}
        </Text>
      </View>

      <ScrollView scrollY>
        <View className={styles.categoryGrid}>
          {categories.map((cat, idx) => (
            <View
              key={cat.id}
              className={styles.categoryCard}
              onClick={() => handleCategoryClick(cat)}
            >
              <View className={styles.cardHeader}>
                <View className={`${styles.categoryIcon} ${bgClasses[idx % 8]}`}>
                  {cat.icon}
                </View>
                <View className={styles.categoryMeta}>
                  <Text className={styles.categoryName}>{cat.name}</Text>
                  <Text className={styles.postCount}>{cat.count} 条帖子</Text>
                </View>
              </View>
              <Text className={styles.categoryDesc}>{cat.description}</Text>
              <View className={styles.cardFooter}>
                <View
                  className={styles.viewPosts}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewPosts(cat);
                  }}
                >
                  浏览帖子 →
                </View>
                {idx < 3 && <Text className={styles.hotTag}>热门</Text>}
              </View>
            </View>
          ))}
        </View>

        {selectedCategory && (
          <View className={styles.postsSection}>
            <View className={styles.sectionHeader}>
              <View className={styles.sectionTitle}>
                <View
                  className={`${styles.sectionTitleIcon} ${
                    bgClasses[categories.findIndex((c) => c.id === selectedCategory.id) % 8]
                  }`}
                >
                  {selectedCategory.icon}
                </View>
                <Text>{selectedCategory.name} · 最新帖子</Text>
              </View>
              <View className={styles.viewMore} onClick={handleBackToCategories}>
                ← 返回分类
              </View>
            </View>
            {categoryPosts.length > 0 ? (
              categoryPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <View style={{ padding: '48rpx 0' }}>
                <Text
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    color: '#86909C',
                    fontSize: '28rpx'
                  }}
                >
                  暂无该分类下的帖子
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CategoryPage;
