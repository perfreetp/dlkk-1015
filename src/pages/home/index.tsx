import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import PostCard from '@/components/PostCard';
import EmptyState from '@/components/EmptyState';
import { Post } from '@/types';
import { useApp } from '@/store/AppContext';
import styles from './index.module.scss';

type TabType = 'latest' | 'hot' | 'nearby';

const HomePage: React.FC = () => {
  const { user, posts, getHotPosts, getPostsByBuilding } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const buildings = ['all', '1栋', '2栋', '3栋', '4栋', '5栋', '6栋', '7栋', '8栋'];

  const getPosts = useCallback(() => {
    let result: Post[] = [];

    switch (activeTab) {
      case 'hot':
        result = getHotPosts();
        break;
      case 'nearby':
        result = selectedBuilding === 'all' ? posts : getPostsByBuilding(selectedBuilding);
        break;
      case 'latest':
      default:
        result = [...posts].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(keyword) ||
          p.content.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [activeTab, selectedBuilding, searchText, posts, getHotPosts, getPostsByBuilding]);

  const displayPosts = useMemo(() => getPosts(), [getPosts]);

  usePullDownRefresh(() => {
    console.log('[HomePage] Pull down refresh');
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  useDidShow(() => {
    console.log('[HomePage] Page show, user:', user.nickname);
  });

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    console.log('[HomePage] Tab changed:', tab);
  };

  const handleBuildingChange = (building: string) => {
    setSelectedBuilding(building);
    console.log('[HomePage] Building filter:', building);
  };

  const handleGoPost = () => {
    Taro.navigateTo({ url: '/pages/post/index' });
  };

  const handleQuickEntry = (type: string) => {
    console.log('[HomePage] Quick entry clicked:', type);
    Taro.navigateTo({ url: `/pages/post/index?category=${type}` });
  };

  const handleCategoryClick = () => {
    Taro.switchTab({ url: '/pages/category/index' });
  };

  const handleActivityClick = () => {
    Taro.switchTab({ url: '/pages/activity/index' });
  };

  return (
    <View className={styles.homePage}>
      <View className={styles.header}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchText}
            placeholder="搜索邻里帖子、活动..."
            value={searchText}
            onInput={(e) => handleSearch(e.detail.value)}
            confirmType="search"
          />
        </View>

        <View className={styles.quickEntries}>
          <View className={styles.quickEntry} onClick={() => handleQuickEntry('idle')}>
            <View className={classnames(styles.entryIcon, styles.entry1)}>🛒</View>
            <Text className={styles.entryName}>闲置</Text>
          </View>
          <View className={styles.quickEntry} onClick={() => handleQuickEntry('carpool')}>
            <View className={classnames(styles.entryIcon, styles.entry2)}>🚗</View>
            <Text className={styles.entryName}>拼车</Text>
          </View>
          <View className={styles.quickEntry} onClick={handleActivityClick}>
            <View className={classnames(styles.entryIcon, styles.entry3)}>🎉</View>
            <Text className={styles.entryName}>活动</Text>
          </View>
          <View className={styles.quickEntry} onClick={handleCategoryClick}>
            <View className={classnames(styles.entryIcon, styles.entry4)}>📂</View>
            <Text className={styles.entryName}>全部分类</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabSection}>
        <View className={styles.tabBar}>
          <Button
            className={classnames(styles.tabItem, activeTab === 'latest' && styles.tabItemActive)}
            onClick={() => handleTabChange('latest')}
          >
            最新
          </Button>
          <Button
            className={classnames(styles.tabItem, activeTab === 'hot' && styles.tabItemActive)}
            onClick={() => handleTabChange('hot')}
          >
            热门
          </Button>
          <Button
            className={classnames(styles.tabItem, activeTab === 'nearby' && styles.tabItemActive)}
            onClick={() => handleTabChange('nearby')}
          >
            附近楼栋
          </Button>
        </View>

        {activeTab === 'nearby' && (
          <View className={styles.buildingFilter}>
            <Text className={styles.filterLabel}>选择楼栋：</Text>
            <ScrollView scrollX className={styles.buildingList}>
              {buildings.map((b) => (
                <Button
                  key={b}
                  className={classnames(
                    styles.buildingChip,
                    selectedBuilding === b && styles.buildingChipActive
                  )}
                  onClick={() => handleBuildingChange(b)}
                >
                  {b === 'all' ? '全部' : b}
                </Button>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView scrollY className={styles.postList}>
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <EmptyState
            icon="📝"
            title="暂无相关帖子"
            description="换个筛选条件试试，或者发布第一条内容吧"
            actionText="去发帖"
            onAction={handleGoPost}
          />
        )}
      </ScrollView>

      <View className={styles.fab} onClick={handleGoPost}>
        <Text className={styles.fabIcon}>✏️</Text>
      </View>
    </View>
  );
};

export default HomePage;
