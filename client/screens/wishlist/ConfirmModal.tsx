import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/constants/theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  showCancelButton?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  confirmColor,
  icon = 'circle-check',
  iconColor,
  iconBgColor,
  onConfirm,
  onCancel,
  loading = false,
  showCancelButton = true,
}: ConfirmModalProps) {
  const { theme } = useTheme();
  const confirmBtnColor = confirmColor || '#5ED6A0';
  const iconBtnColor = iconColor || '#5ED6A0';
  const iconBg = iconBgColor || '#E0F8EC';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { shadowColor: theme.primary }]}>
          {/* 图标 */}
          <View style={[styles.iconContainer, { 
            backgroundColor: iconBg,
            shadowColor: iconBtnColor,
          }]}>
            <FontAwesome6 
              name={icon} 
              size={32} 
              color={iconBtnColor} 
            />
          </View>
          
          {/* 标题 */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          
          {/* 消息 */}
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          
          {/* 按钮 */}
          <View style={styles.buttonsContainer}>
            {showCancelButton && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.confirmButton, 
                { 
                  backgroundColor: confirmBtnColor,
                  shadowColor: confirmBtnColor,
                  flex: showCancelButton ? 1 : undefined,
                }
              ]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? '处理中...' : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#F0EDF7',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
  },
});
