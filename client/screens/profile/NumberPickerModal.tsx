import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/constants/theme';

interface NumberPickerModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (year: number, month?: number) => void;
  mode: 'year' | 'month';  // year模式只选年，month模式选年+月
  initialYear: number;
  initialMonth?: number;
  minYear?: number;
  maxYear?: number;
}

export function NumberPickerModal({
  visible,
  title,
  onClose,
  onConfirm,
  mode,
  initialYear,
  initialMonth,
  minYear = 2020,
  maxYear = new Date().getFullYear() + 1,
}: NumberPickerModalProps) {
  const { theme } = useTheme();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || 1);
  
  const yearScrollViewRef = useRef<ScrollView>(null);
  const monthScrollViewRef = useRef<ScrollView>(null);

  // 生成年份列表
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  // 生成月份列表
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    setSelectedYear(initialYear);
    if (initialMonth) {
      setSelectedMonth(initialMonth);
    }
  }, [initialYear, initialMonth, visible]);

  // 滚动到选中项
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        const yearIndex = years.indexOf(selectedYear);
        if (yearIndex >= 0) {
          yearScrollViewRef.current?.scrollTo({
            y: yearIndex * 44,
            animated: false,
          });
        }

        if (mode === 'month') {
          const monthIndex = selectedMonth - 1;
          monthScrollViewRef.current?.scrollTo({
            y: monthIndex * 44,
            animated: false,
          });
        }
      }, 100);
    }
  }, [visible, selectedYear, selectedMonth, mode, years]);

  const handleYearScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / 44);
    if (index >= 0 && index < years.length) {
      setSelectedYear(years[index]);
    }
  };

  const handleMonthScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / 44);
    if (index >= 0 && index < 12) {
      setSelectedMonth(index + 1);
    }
  };

  const handleConfirm = () => {
    if (mode === 'year') {
      onConfirm(selectedYear);
    } else {
      onConfirm(selectedYear, selectedMonth);
    }
    onClose();
  };

  const renderPickerItem = (value: number, isSelected: boolean, label?: string) => (
    <View
      key={value}
      style={[
        styles.pickerItem,
        isSelected && { backgroundColor: theme.primary + '20' },
      ]}
    >
      <Text style={[
        styles.pickerItemText,
        { color: isSelected ? theme.primary : theme.textSecondary },
        isSelected && styles.pickerItemTextSelected,
      ]}>
        {label || value}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome6 name="xmark" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Picker区域 */}
          <View style={styles.pickersContainer}>
            {/* 年份选择器 */}
            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, { color: theme.textMuted }]}>年份</Text>
              <View style={styles.pickerWrapper}>
                <ScrollView
                  ref={yearScrollViewRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={44}
                  decelerationRate="fast"
                  onScrollEndDrag={handleYearScroll}
                  onMomentumScrollEnd={handleYearScroll}
                  contentContainerStyle={styles.pickerScrollContent}
                >
                  <View style={styles.pickerPadding} />
                  {years.map(year => renderPickerItem(year, year === selectedYear))}
                  <View style={styles.pickerPadding} />
                </ScrollView>
                {/* 高亮框 */}
                <View style={[styles.highlightBox, { borderColor: theme.primary }]} pointerEvents="none" />
              </View>
            </View>

            {/* 月份选择器 (仅month模式显示) */}
            {mode === 'month' && (
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: theme.textMuted }]}>月份</Text>
                <View style={styles.pickerWrapper}>
                  <ScrollView
                    ref={monthScrollViewRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={44}
                    decelerationRate="fast"
                    onScrollEndDrag={handleMonthScroll}
                    onMomentumScrollEnd={handleMonthScroll}
                    contentContainerStyle={styles.pickerScrollContent}
                  >
                    <View style={styles.pickerPadding} />
                    {months.map(month => renderPickerItem(month, month === selectedMonth, `${month}月`))}
                    <View style={styles.pickerPadding} />
                  </ScrollView>
                  {/* 高亮框 */}
                  <View style={[styles.highlightBox, { borderColor: theme.primary }]} pointerEvents="none" />
                </View>
              </View>
            )}
          </View>

          {/* 预览选中值 */}
          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, { color: theme.textPrimary }]}>
              已选择：{selectedYear}年{mode === 'month' ? ` ${selectedMonth}月` : ''}
            </Text>
          </View>

          {/* 确认按钮 */}
          <TouchableOpacity 
            style={[styles.confirmButton, { backgroundColor: theme.primary }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>确定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0EDF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  pickerWrapper: {
    width: '100%',
    height: 132,
    position: 'relative',
    backgroundColor: '#F8F7FA',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  pickerScrollContent: {
    paddingVertical: 0,
  },
  pickerPadding: {
    height: 44,
  },
  pickerItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  pickerItemText: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerItemTextSelected: {
    fontWeight: '800',
  },
  highlightBox: {
    position: 'absolute',
    top: 44,
    left: 4,
    right: 4,
    height: 44,
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
