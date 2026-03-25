import React, { useMemo } from 'react';
import { ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

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
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentWishes, setRecentWishes] = useState<WishPlace[]>([]);
  const [recentFootprints, setRecentFootprints] = useState<Footprint[]>([]);
  const [loading, setLoading] = useState(true);

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
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedView level="root" style={styles.container}>
          {/* Hero区域 */}
          <View style={styles.heroContainer}>
            <ThemedText style={styles.heroTitle}>
              记录每一处风景
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              让美好的地方不遗忘
            </ThemedText>
          </View>

          {/* 统计卡片 */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: theme.backgroundTertiary }]}>
                  <FontAwesome6 name="heart" size={24} color={theme.clayPink} solid />
                </View>
                <ThemedText variant="stat" color={theme.textPrimary}>
                  {stats?.totalWishes || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>心愿清单</ThemedText>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: theme.backgroundTertiary }]}>
                  <FontAwesome6 name="shoe-prints" size={24} color={theme.clayGreen} solid />
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
    </Screen>
  );
}
