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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface Footprint {
  id: string;
  name: string;
  distance?: string;
  scenery_features?: string;
  notes?: string;
  visited_at: string;
  wish_place_id?: string;
  created_at: string;
}

export default function FootprintsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [filteredFootprints, setFilteredFootprints] = useState<Footprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFootprint, setEditingFootprint] = useState<Footprint | null>(null);
  
  // 备注弹窗
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedFootprint, setSelectedFootprint] = useState<Footprint | null>(null);
  
  // 表单字段
  const [name, setName] = useState('');
  const [distance, setDistance] = useState('');
  const [sceneryFeatures, setSceneryFeatures] = useState('');
  const [notes, setNotes] = useState('');
  const [visitedDate, setVisitedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchFootprints = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/footprints`);
      const data = await response.json();
      setFootprints(data);
      setFilteredFootprints(data);
    } catch (error) {
      console.error('Error fetching footprints:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFootprints();
    }, [fetchFootprints])
  );

  // 搜索过滤
  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredFootprints(footprints);
    } else {
      const lowerText = text.toLowerCase();
      const filtered = footprints.filter(fp => 
        fp.name.toLowerCase().includes(lowerText) ||
        (fp.scenery_features && fp.scenery_features.toLowerCase().includes(lowerText)) ||
        (fp.notes && fp.notes.toLowerCase().includes(lowerText))
      );
      setFilteredFootprints(filtered);
    }
  }, [footprints]);

  const handleOpenModal = (footprint?: Footprint) => {
    if (footprint) {
      setEditingFootprint(footprint);
      setName(footprint.name);
      setDistance(footprint.distance || '');
      setSceneryFeatures(footprint.scenery_features || '');
      setNotes(footprint.notes || '');
      setVisitedDate(new Date(footprint.visited_at));
    } else {
      setEditingFootprint(null);
      setName('');
      setDistance('');
      setSceneryFeatures('');
      setNotes('');
      setVisitedDate(new Date());
    }
    setModalVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setVisitedDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入地点名称');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingFootprint) {
        // 更新足迹
        await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/footprints/${editingFootprint.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            distance: distance.trim() || null,
            sceneryFeatures: sceneryFeatures.trim() || null,
            notes: notes.trim() || null,
            visitedAt: visitedDate.toISOString(),
          }),
        });
      } else {
        // 创建足迹
        await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/footprints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            distance: distance.trim() || null,
            sceneryFeatures: sceneryFeatures.trim() || null,
            notes: notes.trim() || null,
            visitedAt: visitedDate.toISOString(),
          }),
        });
      }
      
      setModalVisible(false);
      fetchFootprints();
    } catch (error) {
      console.error('Error saving footprint:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个足迹记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/footprints/${id}`, {
                method: 'DELETE',
              });
              fetchFootprints();
            } catch (error) {
              console.error('Error deleting footprint:', error);
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'} safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'} safeAreaEdges={['left', 'right', 'bottom']}>
      <ThemedView level="root" style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <ThemedText style={styles.headerTitle}>足迹地图</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            记录去过的地方，留住美好回忆
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
        {filteredFootprints.length > 0 ? (
          <ScrollView 
            contentContainerStyle={styles.listContent} 
            showsVerticalScrollIndicator={false}
          >
            {filteredFootprints.map((footprint) => (
              <TouchableOpacity 
                key={footprint.id} 
                style={styles.card}
                onPress={() => {
                  if (footprint.notes) {
                    setSelectedFootprint(footprint);
                    setNotesModalVisible(true);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: '#E0F8EC' }]}>
                    <FontAwesome6 name="shoe-prints" size={16} color={theme.clayGreen} solid />
                  </View>
                  <ThemedText style={styles.cardTitle}>{footprint.name}</ThemedText>
                  
                  {/* 编辑删除按钮放在标题后 */}
                  <TouchableOpacity 
                    style={styles.headerIconBtn}
                    onPress={() => handleOpenModal(footprint)}
                  >
                    <FontAwesome6 name="pen" size={11} color={theme.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.headerIconBtn}
                    onPress={() => handleDelete(footprint.id)}
                  >
                    <FontAwesome6 name="trash" size={11} color={theme.error} />
                  </TouchableOpacity>
                </View>

                {/* 时间和特征同行 */}
                <View style={styles.tagsRow}>
                  <View style={styles.dateTag}>
                    <FontAwesome6 name="calendar-check" size={10} color={theme.clayGreen} />
                    <ThemedText style={styles.dateTagText}>
                      {formatDate(footprint.visited_at)}
                    </ThemedText>
                  </View>

                  {footprint.scenery_features && (
                    <View style={styles.featureTag}>
                      <FontAwesome6 name="camera" size={10} color={theme.textSecondary} />
                      <ThemedText style={styles.featureTagText}>
                        {footprint.scenery_features}
                      </ThemedText>
                    </View>
                  )}

                  {footprint.distance && (
                    <View style={styles.distanceTag}>
                      <FontAwesome6 name="location-dot" size={10} color={theme.textMuted} />
                      <ThemedText style={styles.distanceTagText}>
                        {footprint.distance}
                      </ThemedText>
                    </View>
                  )}
                  
                  {footprint.notes && (
                    <View style={styles.notesHint}>
                      <FontAwesome6 name="message" size={10} color={theme.textMuted} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <FontAwesome6 name="shoe-prints" size={40} color={theme.textMuted} />
            </View>
            <ThemedText style={styles.emptyText}>
              {searchText ? '没有找到匹配的足迹' : '还没有足迹，快去打卡吧~'}
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
            <View style={[styles.modalOverlay, { paddingTop: insets.top + 10 }]}>
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>
                    {editingFootprint ? '编辑足迹' : '新增足迹'}
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

                <ThemedText style={styles.inputLabel}>打卡时间</ThemedText>
                <TouchableOpacity 
                  style={styles.datePickerRow}
                  onPress={() => setShowDatePicker(true)}
                >
                  <ThemedText style={styles.datePickerText}>
                    {visitedDate.toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </ThemedText>
                  <View style={styles.datePickerBtn}>
                    <FontAwesome6 name="calendar" size={16} color={theme.primary} />
                    <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>选择日期</ThemedText>
                  </View>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={visitedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}

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
                      {editingFootprint ? '保存修改' : '添加足迹'}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 备注弹窗 */}
      <Modal
        visible={notesModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setNotesModalVisible(false)}
      >
        <TouchableOpacity 
          style={[styles.notesModalOverlay, { paddingTop: insets.top + 10 }]}
          activeOpacity={1}
          onPress={() => setNotesModalVisible(false)}
        >
          <View style={styles.notesModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.notesModalHeader}>
              <View style={styles.notesModalIcon}>
                <FontAwesome6 name="message" size={20} color={theme.primary} />
              </View>
              <ThemedText style={styles.notesModalTitle}>
                {selectedFootprint?.name}
              </ThemedText>
              <TouchableOpacity 
                style={styles.notesCloseBtn}
                onPress={() => setNotesModalVisible(false)}
              >
                <FontAwesome6 name="xmark" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.notesModalBody}>
              <ThemedText style={styles.notesText}>
                {selectedFootprint?.notes}
              </ThemedText>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </Screen>
  );
}
