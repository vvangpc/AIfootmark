import React, { useMemo, useState, useCallback } from 'react';
import { 
  ScrollView, 
  View, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface WishPlace {
  id: string;
  name: string;
  distance?: string;
  scenery_features?: string;
  notes?: string;
  is_visited: boolean;
  created_at: string;
}

export default function WishlistScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [wishes, setWishes] = useState<WishPlace[]>([]);
  const [filteredWishes, setFilteredWishes] = useState<WishPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWish, setEditingWish] = useState<WishPlace | null>(null);
  
  // 表单字段
  const [name, setName] = useState('');
  const [distance, setDistance] = useState('');
  const [sceneryFeatures, setSceneryFeatures] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWishes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wish-places`);
      const data = await response.json();
      // 只显示未打卡的心愿
      const unvisited = data.filter((w: WishPlace) => !w.is_visited);
      setWishes(unvisited);
      setFilteredWishes(unvisited);
    } catch (error) {
      console.error('Error fetching wishes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWishes();
    }, [fetchWishes])
  );

  // 搜索过滤
  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredWishes(wishes);
    } else {
      const lowerText = text.toLowerCase();
      const filtered = wishes.filter(w => 
        w.name.toLowerCase().includes(lowerText) ||
        (w.scenery_features && w.scenery_features.toLowerCase().includes(lowerText)) ||
        (w.notes && w.notes.toLowerCase().includes(lowerText))
      );
      setFilteredWishes(filtered);
    }
  }, [wishes]);

  const handleOpenModal = (wish?: WishPlace) => {
    if (wish) {
      setEditingWish(wish);
      setName(wish.name);
      setDistance(wish.distance || '');
      setSceneryFeatures(wish.scenery_features || '');
      setNotes(wish.notes || '');
    } else {
      setEditingWish(null);
      setName('');
      setDistance('');
      setSceneryFeatures('');
      setNotes('');
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入地点名称');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingWish) {
        // 更新心愿
        await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wish-places/${editingWish.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            distance: distance.trim() || null,
            sceneryFeatures: sceneryFeatures.trim() || null,
            notes: notes.trim() || null,
          }),
        });
      } else {
        // 创建心愿
        await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wish-places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            distance: distance.trim() || null,
            sceneryFeatures: sceneryFeatures.trim() || null,
            notes: notes.trim() || null,
          }),
        });
      }
      
      setModalVisible(false);
      fetchWishes();
    } catch (error) {
      console.error('Error saving wish:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个心愿吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wish-places/${id}`, {
                method: 'DELETE',
              });
              fetchWishes();
            } catch (error) {
              console.error('Error deleting wish:', error);
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };

  const handleCheckIn = async (wish: WishPlace) => {
    Alert.alert(
      '打卡确认',
      `确定要在"${wish.name}"打卡吗？打卡后将添加到足迹记录中。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '打卡',
          onPress: async () => {
            try {
              const response = await fetch(
                `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wish-places/${wish.id}/check-in`,
                { method: 'POST' }
              );
              
              if (response.ok) {
                Alert.alert('成功', '打卡成功！已添加到足迹记录');
                fetchWishes();
              } else {
                throw new Error('Check-in failed');
              }
            } catch (error) {
              console.error('Error checking in:', error);
              Alert.alert('错误', '打卡失败，请重试');
            }
          },
        },
      ]
    );
  };

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
      <ThemedView level="root" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>心愿清单</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            记录想去的地方，期待未来的旅程
          </ThemedText>
        </View>

        {/* 搜索框 */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <FontAwesome6 name="magnifying-glass" size={18} color={theme.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索地点、风景特征..."
              placeholderTextColor={theme.textMuted}
              value={searchText}
              onChangeText={handleSearch}
            />
            {searchText.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => handleSearch('')}
              >
                <FontAwesome6 name="xmark" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* List */}
        {filteredWishes.length > 0 ? (
          <ScrollView 
            contentContainerStyle={styles.listContent} 
            showsVerticalScrollIndicator={false}
          >
            {filteredWishes.map((wish) => (
              <View key={wish.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: '#FFE8EE' }]}>
                    <FontAwesome6 name="heart" size={24} color={theme.clayPink} solid />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.cardTitle}>{wish.name}</ThemedText>
                    <View style={styles.cardMeta}>
                      {wish.distance && (
                        <ThemedText style={styles.cardMetaText}>
                          距离：{wish.distance}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                </View>

                {wish.scenery_features && (
                  <View style={styles.featureTag}>
                    <FontAwesome6 name="camera" size={12} color={theme.textSecondary} />
                    <ThemedText style={styles.featureTagText}>
                      {wish.scenery_features}
                    </ThemedText>
                  </View>
                )}

                {wish.notes && (
                  <ThemedText style={[styles.cardMetaText, { marginTop: 8 }]}>
                    {wish.notes}
                  </ThemedText>
                )}

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.checkInBtn]}
                    onPress={() => handleCheckIn(wish)}
                  >
                    <FontAwesome6 name="check" size={14} color="#FFFFFF" />
                    <ThemedText style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
                      打卡
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => handleOpenModal(wish)}
                  >
                    <FontAwesome6 name="pen" size={14} color={theme.textSecondary} />
                    <ThemedText style={[styles.actionBtnText, { color: theme.textSecondary }]}>
                      编辑
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(wish.id)}
                  >
                    <FontAwesome6 name="trash" size={14} color={theme.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <FontAwesome6 name="heart" size={40} color={theme.textMuted} />
            </View>
            <ThemedText style={styles.emptyText}>
              {searchText ? '没有找到匹配的心愿' : '还没有心愿，快去添加吧~'}
            </ThemedText>
          </View>
        )}

        {/* FAB Button */}
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => handleOpenModal()}
        >
          <FontAwesome6 name="plus" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </ThemedView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalOverlay}>
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>
                    {editingWish ? '编辑心愿' : '新增心愿'}
                  </ThemedText>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <FontAwesome6 name="xmark" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ThemedText style={styles.inputLabel}>地点名称 *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="例如：大理洱海"
                  placeholderTextColor={theme.textMuted}
                  value={name}
                  onChangeText={setName}
                />

                <ThemedText style={styles.inputLabel}>距离</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="例如：约500公里"
                  placeholderTextColor={theme.textMuted}
                  value={distance}
                  onChangeText={setDistance}
                />

                <ThemedText style={styles.inputLabel}>风景特征</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="例如：湖泊、古镇、雪山"
                  placeholderTextColor={theme.textMuted}
                  value={sceneryFeatures}
                  onChangeText={setSceneryFeatures}
                />

                <ThemedText style={styles.inputLabel}>备注</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="添加一些备注..."
                  placeholderTextColor={theme.textMuted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.submitButtonText}>
                      {editingWish ? '保存修改' : '添加心愿'}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </Screen>
  );
}
