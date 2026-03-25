import React, { useMemo } from 'react';
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Text, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';
import { HeroEditModal } from './HeroEditModal';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

// 响应式尺寸
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;
const iconSize = isSmallScreen ? 20 : 24;

// 存储键
const HERO_TITLE_KEY = 'hero_title';
const HERO_TITLE_SIZE_KEY = 'hero_title_size';

// 默认值
const DEFAULT_TITLE = '记录每一处风景';
const DEFAULT_TITLE_SIZE = 28;

interface Stats {
  totalWishes: number;
  visitedWishes: number;
  unvisitedWishes: number;
  totalFootprints: number;
}

interface WishPlace {
  id: string;
  name: string;
  distance?: string;
  scenery_features?: string;
  notes?: string;
  is_visited: boolean;
  created_at: string;
}

interface Footprint {
  id: string;
  name: string;
  distance?: string;
  scenery_features?: string;
  notes?: string;
  visited_at: string;
  created_at: string;
}

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const router = useSafeRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentWishes, setRecentWishes] = useState<WishPlace[]>([]);
  const [recentFootprints, setRecentFootprints] = useState<Footprint[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero 编辑相关状态
  const [heroTitle, setHeroTitle] = useState(DEFAULT_TITLE);
  const [heroTitleSize, setHeroTitleSize] = useState(DEFAULT_TITLE_SIZE);
  const [heroEditModalVisible, setHeroEditModalVisible] = useState(false);

  // 加载Hero设置
  const loadHeroSettings = useCallback(async () => {
    try {
      const [savedTitle, savedTitleSize] = await Promise.all([
        AsyncStorage.getItem(HERO_TITLE_KEY),
        AsyncStorage.getItem(HERO_TITLE_SIZE_KEY),
      ]);

      if (savedTitle) setHeroTitle(savedTitle);
      if (savedTitleSize) setHeroTitleSize(parseInt(savedTitleSize, 10));
    } catch (error) {
      console.error('Error loading hero settings:', error);
    }
  }, []);

  // 保存Hero设置
  const saveHeroSettings = async (title: string, titleSize: number) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(HERO_TITLE_KEY, title),
        AsyncStorage.setItem(HERO_TITLE_SIZE_KEY, titleSize.toString()),
      ]);
      setHeroTitle(title);
      setHeroTitleSize(titleSize);
    } catch (error) {
      console.error('Error saving hero settings:', error);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 获取统计数据
      const statsRes = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // 获取最近的心愿（前3条）
      const wishesRes = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wish-places?isVisited=false`);
      const wishesData = await wishesRes.json();
      setRecentWishes(wishesData.slice(0, 3));

      // 获取最近的足迹（前3条）
      const footprintsRes = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/footprints`);
      const footprintsData = await footprintsRes.json();
      setRecentFootprints(footprintsData.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHeroSettings();
      fetchData();
    }, [loadHeroSettings, fetchData])
  );

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'} safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'} safeAreaEdges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedView level="root" style={styles.container}>
          {/* Hero区域 - 可点击编辑，文字悬浮在上层 */}
          <TouchableOpacity 
            style={styles.heroContainer}
            onPress={() => setHeroEditModalVisible(true)}
            activeOpacity={0.9}
          >
            {/* 背景装饰层 */}
            <View style={styles.heroBgDecor} />
            
            {/* 文字层 - 悬浮在上层 */}
            <View style={styles.heroContent}>
              <Text style={[styles.heroTitle, { fontSize: heroTitleSize }]}>
                {heroTitle}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 统计卡片 */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: theme.backgroundTertiary }]}>
                  <FontAwesome6 name="heart" size={iconSize} color={theme.clayPink} solid />
                </View>
                <ThemedText variant="stat" color={theme.textPrimary}>
                  {stats?.totalWishes || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>心愿清单</ThemedText>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: theme.backgroundTertiary }]}>
                  <FontAwesome6 name="shoe-prints" size={iconSize} color={theme.clayGreen} solid />
                </View>
                <ThemedText variant="stat" color={theme.textPrimary}>
                  {stats?.totalFootprints || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>足迹记录</ThemedText>
              </View>
            </View>
          </View>

          {/* 最近心愿 */}
          <View style={styles.recentSection}>
            <ThemedText style={styles.sectionTitle}>最近心愿</ThemedText>
            {recentWishes.length > 0 ? (
              recentWishes.map((wish) => (
                <TouchableOpacity 
                  key={wish.id} 
                  style={styles.recentCard}
                  onPress={() => router.push('/wishlist')}
                >
                  <View style={styles.recentItem}>
                    <View style={[styles.recentItemIcon, { backgroundColor: '#FFE8EE' }]}>
                      <FontAwesome6 name="heart" size={18} color={theme.clayPink} solid />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.recentItemText}>{wish.name}</ThemedText>
                      {wish.distance && (
                        <ThemedText style={styles.recentItemMeta}>{wish.distance}</ThemedText>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.recentCard}>
                <View style={styles.emptyState}>
                  <FontAwesome6 name="heart" size={32} color={theme.textMuted} />
                  <ThemedText style={styles.emptyText}>还没有心愿，快去添加吧~</ThemedText>
                </View>
              </View>
            )}
          </View>

          {/* 最近足迹 */}
          <View style={[styles.recentSection, { marginBottom: 20 }]}>
            <ThemedText style={styles.sectionTitle}>最近足迹</ThemedText>
            {recentFootprints.length > 0 ? (
              recentFootprints.map((footprint) => (
                <TouchableOpacity 
                  key={footprint.id} 
                  style={styles.recentCard}
                  onPress={() => router.push('/footprints')}
                >
                  <View style={styles.recentItem}>
                    <View style={[styles.recentItemIcon, { backgroundColor: '#E0F8EC' }]}>
                      <FontAwesome6 name="shoe-prints" size={18} color={theme.clayGreen} solid />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.recentItemText}>{footprint.name}</ThemedText>
                      <ThemedText style={styles.recentItemMeta}>
                        {new Date(footprint.visited_at).toLocaleDateString('zh-CN')}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.recentCard}>
                <View style={styles.emptyState}>
                  <FontAwesome6 name="shoe-prints" size={32} color={theme.textMuted} />
                  <ThemedText style={styles.emptyText}>还没有足迹，去打卡吧~</ThemedText>
                </View>
              </View>
            )}
          </View>
        </ThemedView>
      </ScrollView>

      {/* Hero编辑弹窗 - 使用key确保每次打开时重新创建 */}
      <HeroEditModal
        key={`hero-edit-${heroEditModalVisible}`}
        visible={heroEditModalVisible}
        onClose={() => setHeroEditModalVisible(false)}
        onSave={saveHeroSettings}
        initialTitle={heroTitle}
        initialTitleSize={heroTitleSize}
      />
    </Screen>
  );
}
