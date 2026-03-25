import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/constants/theme';

interface HeroEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, titleSize: number) => void;
  initialTitle: string;
  initialTitleSize: number;
}

const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 40;

export function HeroEditModal({
  visible,
  onClose,
  onSave,
  initialTitle,
  initialTitleSize,
}: HeroEditModalProps) {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initialTitle);
  const [titleSize, setTitleSize] = useState(initialTitleSize);

  const handleSave = () => {
    onSave(title, titleSize);
    onClose();
  };

  // 关闭时重置为初始值
  const handleClose = () => {
    setTitle(initialTitle);
    setTitleSize(initialTitleSize);
    onClose();
  };

  const adjustFontSize = (currentSize: number, delta: number, setter: (size: number) => void) => {
    const newSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, currentSize + delta));
    setter(newSize);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>编辑首页标语</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <FontAwesome6 name="xmark" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 主标题编辑 */}
          <View style={styles.editSection}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>主标题</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.backgroundTertiary, 
                color: theme.textPrimary,
                fontSize: titleSize,
              }]}
              value={title}
              onChangeText={setTitle}
              placeholder="请输入主标题"
              placeholderTextColor={theme.textMuted}
              multiline
            />
            {/* 字体大小调节 */}
            <View style={styles.fontSizeRow}>
              <Text style={[styles.fontSizeLabel, { color: theme.textMuted }]}>字体大小</Text>
              <View style={styles.fontSizeControls}>
                <TouchableOpacity 
                  style={[styles.sizeBtn, { backgroundColor: theme.backgroundTertiary }]}
                  onPress={() => adjustFontSize(titleSize, -2, setTitleSize)}
                >
                  <FontAwesome6 name="minus" size={14} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.sizeValue, { color: theme.textPrimary }]}>{titleSize}</Text>
                <TouchableOpacity 
                  style={[styles.sizeBtn, { backgroundColor: theme.backgroundTertiary }]}
                  onPress={() => adjustFontSize(titleSize, 2, setTitleSize)}
                >
                  <FontAwesome6 name="plus" size={14} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 保存按钮 */}
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>保存修改</Text>
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
  editSection: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  input: {
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontWeight: '700',
    lineHeight: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    minHeight: 80,
  },
  fontSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  fontSizeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sizeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  sizeValue: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  saveButton: {
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
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
