import React, { useMemo, useState, useCallback } from 'react';
import { 
  ScrollView, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface TimeStats {
  week: number;
  month: number;
  year: number;
  monthlyStats: { month: string; count: number }[];
}

interface Stats {
  totalWishes: number;
  visitedWishes: number;
  unvisitedWishes: number;
  totalFootprints: number;
}

interface Footprint {
  id: string;
  name: string;
  distance?: string;
  scenery_features?: string;
  notes?: string;
  visited_at: string;
}

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null);
  
  // Modal相关
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalRecords, setModalRecords] = useState<Footprint[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  
  // 时间选择器
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 获取基本统计
      const statsRes = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // 获取时间统计
      const timeRes = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/stats/time`);
      const timeData = await timeRes.json();
      setTimeStats(timeData);
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

  // 获取本周打卡记录
  const fetchWeekRecords = async () => {
    try {
      setModalLoading(true);
      setModalTitle('本周打卡记录');
      setModalVisible(true);
      
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(now);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      
      const response = await fetch(
        `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/footprints?startDate=${weekStart.toISOString()}&endDate=${now.toISOString()}`
      );
      const data = await response.json();
      setModalRecords(data);
    } catch (error) {
      console.error('Error fetching week records:', error);
    } finally {
      setModalLoading(false);
    }
  };

  // 获取指定月份打卡记录
  const fetchMonthRecords = async (year: number, month: number) => {
    try {
      setModalLoading(true);
      setModalTitle(`${year}年${month}月打卡记录`);
      setModalVisible(true);
      setShowMonthPicker(false);
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const response = await fetch(
        `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/footprints?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();
      setModalRecords(data);
    } catch (error) {
      console.error('Error fetching month records:', error);
    } finally {
      setModalLoading(false);
    }
  };

  // 获取指定年打卡记录
  const fetchYearRecords = async (year: number) => {
    try {
      setModalLoading(true);
      setModalTitle(`${year}年打卡记录`);
      setModalVisible(true);
      setShowYearPicker(false);
      
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      
      const response = await fetch(
        `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/footprints?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();
      setModalRecords(data);
    } catch (error) {
      console.error('Error fetching year records:', error);
    } finally {
      setModalLoading(false);
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      setExporting(true);
      
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/export`);
      const data = await response.json();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `足迹小本本_${timestamp}.json`;
      const filePath = `${(FileSystem as any).documentDirectory}${fileName}`;
      
      await (FileSystem as any).writeAsStringAsync(filePath, JSON.stringify(data, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: '导出足迹数据',
        });
      } else {
        Alert.alert('成功', `数据已导出到: ${filePath}`);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      Alert.alert('错误', '导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  // 导入数据
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      const content = await (FileSystem as any).readAsStringAsync(file.uri);
      const data = JSON.parse(content);
      
      if (!data.data || !data.data.wishPlaces || !data.data.footprints) {
        Alert.alert('错误', '文件格式不正确');
        return;
      }

      Alert.alert(
        '确认导入',
        `即将导入 ${data.data.wishPlaces?.length || 0} 条心愿和 ${data.data.footprints?.length || 0} 条足迹记录。\n\n注意：现有数据将被保留，新数据将追加。`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '导入',
            onPress: async () => {
              try {
                setImporting(true);
                
                const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/import`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data.data),
                });
                
                const result = await response.json();
                
                Alert.alert(
                  '导入成功',
                  `成功导入 ${result.imported.wishPlaces} 条心愿和 ${result.imported.footprints} 条足迹记录`
                );
                
                fetchData();
              } catch (error) {
                console.error('Error importing:', error);
                Alert.alert('错误', '导入失败，请重试');
              } finally {
                setImporting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('错误', '文件读取失败，请重试');
    }
  };

  // 清空数据
  const handleClearData = () => {
    Alert.alert(
      '危险操作',
      '确定要清空所有数据吗？此操作不可恢复！\n\n建议先导出备份后再执行此操作。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/data`, {
                method: 'DELETE',
              });
              
              if (response.ok) {
                Alert.alert('成功', '所有数据已清空');
                fetchData();
              } else {
                throw new Error('Clear failed');
              }
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('错误', '清空失败，请重试');
            }
          },
        },
      ]
    );
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 计算图表最大值
  const getMaxCount = () => {
    if (!timeStats?.monthlyStats) return 10;
    const max = Math.max(...timeStats.monthlyStats.map(m => m.count), 1);
    return Math.ceil(max * 1.2);
  };

  // 渲染月度图表
  const renderMonthlyChart = () => {
    if (!timeStats?.monthlyStats) return null;
    
    const maxCount = getMaxCount();
    
    return (
      <View style={styles.chartBars}>
        {timeStats.monthlyStats.slice(-6).map((item, index) => {
          const height = Math.max((item.count / maxCount) * 100, 4);
          const monthLabel = item.month.split('-')[1] + '月';
          
          return (
            <View key={item.month} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height,
                      backgroundColor: index === 5 ? theme.primary : theme.backgroundTertiary,
                    }
                  ]} 
                />
              </View>
              <ThemedText style={styles.barValue}>{item.count}</ThemedText>
              <ThemedText style={styles.barLabel}>{monthLabel}</ThemedText>
            </View>
          );
        })}
      </View>
    );
  };

  // 渲染记录列表
  const renderRecordItem = (record: Footprint) => (
    <View key={record.id} style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <View style={[styles.recordIcon, { backgroundColor: '#E0F8EC' }]}>
          <FontAwesome6 name="shoe-prints" size={16} color={theme.clayGreen} solid />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.recordName}>{record.name}</ThemedText>
          <ThemedText style={styles.recordDate}>{formatDate(record.visited_at)}</ThemedText>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedView level="root" style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>个人中心</ThemedText>
          </View>

          {/* 时间统计 */}
          <View style={styles.statsSection}>
            <ThemedText style={styles.sectionTitle}>打卡统计</ThemedText>
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statCard} onPress={fetchWeekRecords}>
                <View style={[styles.statIcon, { backgroundColor: '#E0F8EC' }]}>
                  <FontAwesome6 name="calendar-week" size={24} color={theme.clayGreen} solid />
                </View>
                <ThemedText style={styles.statNumber}>{timeStats?.week || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>本周打卡</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.statCard} 
                onPress={() => setShowMonthPicker(true)}
              >
                <View style={[styles.statIcon, { backgroundColor: '#FFF4DD' }]}>
                  <FontAwesome6 name="calendar-days" size={24} color={theme.clayYellow} solid />
                </View>
                <ThemedText style={styles.statNumber}>{timeStats?.month || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>月打卡</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.statCard} 
                onPress={() => setShowYearPicker(true)}
              >
                <View style={[styles.statIcon, { backgroundColor: '#FFE8EE' }]}>
                  <FontAwesome6 name="calendar" size={24} color={theme.clayPink} solid />
                </View>
                <ThemedText style={styles.statNumber}>{timeStats?.year || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>年打卡</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* 月度趋势图 */}
          <View style={styles.chartSection}>
            <ThemedText style={styles.sectionTitle}>月度趋势</ThemedText>
            <View style={styles.chartCard}>
              <ThemedText style={styles.chartTitle}>最近6个月打卡数</ThemedText>
              {renderMonthlyChart()}
            </View>
          </View>

          {/* 数据统计 */}
          <View style={styles.statsSection}>
            <ThemedText style={styles.sectionTitle}>数据概览</ThemedText>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#EDE8FF' }]}>
                  <FontAwesome6 name="heart" size={24} color={theme.primary} solid />
                </View>
                <ThemedText style={styles.statNumber}>{stats?.totalWishes || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>心愿总数</ThemedText>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#E0F8EC' }]}>
                  <FontAwesome6 name="shoe-prints" size={24} color={theme.clayGreen} solid />
                </View>
                <ThemedText style={styles.statNumber}>{stats?.totalFootprints || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>足迹总数</ThemedText>
              </View>
            </View>
          </View>

          {/* 功能菜单 */}
          <View style={styles.menuSection}>
            <ThemedText style={styles.sectionTitle}>数据管理</ThemedText>
            <View style={styles.menuCard}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleExport}
                disabled={exporting}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#E0F8EC' }]}>
                  {exporting ? (
                    <ActivityIndicator size="small" color={theme.clayGreen} />
                  ) : (
                    <FontAwesome6 name="upload" size={20} color={theme.clayGreen} />
                  )}
                </View>
                <View style={styles.menuContent}>
                  <ThemedText style={styles.menuTitle}>导出数据</ThemedText>
                  <ThemedText style={styles.menuSubtitle}>导出所有记录为JSON文件</ThemedText>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={handleImport}
                disabled={importing}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#EDE8FF' }]}>
                  {importing ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <FontAwesome6 name="download" size={20} color={theme.primary} />
                  )}
                </View>
                <View style={styles.menuContent}>
                  <ThemedText style={styles.menuTitle}>导入数据</ThemedText>
                  <ThemedText style={styles.menuSubtitle}>从JSON文件导入记录</ThemedText>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 危险操作 */}
          <View style={styles.dangerSection}>
            <ThemedText style={styles.sectionTitle}>危险操作</ThemedText>
            <View style={styles.dangerCard}>
              <TouchableOpacity 
                style={styles.dangerItem}
                onPress={handleClearData}
              >
                <View style={styles.dangerIcon}>
                  <FontAwesome6 name="trash" size={20} color={theme.error} />
                </View>
                <View style={styles.dangerContent}>
                  <ThemedText style={styles.dangerTitle}>清空数据</ThemedText>
                  <ThemedText style={styles.dangerSubtitle}>删除所有心愿和足迹记录（不可恢复）</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 关于 */}
          <View style={styles.aboutSection}>
            <FontAwesome6 name="book-open" size={24} color={theme.textMuted} />
            <ThemedText style={styles.aboutText}>足迹小本本 v1.0.0</ThemedText>
            <ThemedText style={styles.aboutText}>记录每一处风景，留住美好回忆</ThemedText>
          </View>
        </ThemedView>
      </ScrollView>

      {/* 记录列表Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{modalTitle}</ThemedText>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <FontAwesome6 name="xmark" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {modalLoading ? (
              <View style={styles.emptyModal}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : modalRecords.length > 0 ? (
              <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                {modalRecords.map(renderRecordItem)}
              </ScrollView>
            ) : (
              <View style={styles.emptyModal}>
                <FontAwesome6 name="shoe-prints" size={40} color={theme.textMuted} />
                <ThemedText style={styles.emptyModalText}>暂无打卡记录</ThemedText>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 年份选择器 */}
      {showYearPicker && (
        <DateTimePicker
          value={new Date(selectedYear, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowYearPicker(false);
            if (date) {
              const year = date.getFullYear();
              setSelectedYear(year);
              fetchYearRecords(year);
            }
          }}
        />
      )}

      {/* 月份选择器 */}
      {showMonthPicker && (
        <DateTimePicker
          value={new Date(selectedYear, selectedMonth - 1, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowMonthPicker(false);
            if (date) {
              const year = date.getFullYear();
              const month = date.getMonth() + 1;
              setSelectedYear(year);
              setSelectedMonth(month);
              fetchMonthRecords(year, month);
            }
          }}
        />
      )}
    </Screen>
  );
}
