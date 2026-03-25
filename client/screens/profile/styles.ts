import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    scrollContent: {
      paddingBottom: 120,
    },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing["2xl"],
      paddingBottom: Spacing.lg,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.textPrimary,
    },
    // 统计卡片
    statsSection: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.textPrimary,
      marginBottom: Spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius["2xl"],
      padding: Spacing.xl,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.7)',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 6,
    },
    statIcon: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.7)',
    },
    statNumber: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.textPrimary,
      marginBottom: Spacing.xs,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textMuted,
    },
    // 图表区域
    chartSection: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    chartCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius["2xl"],
      padding: Spacing.xl,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.7)',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 6,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: Spacing.lg,
    },
    chartBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 120,
      gap: Spacing.sm,
    },
    chartBar: {
      flex: 1,
      alignItems: 'center',
    },
    barContainer: {
      width: '100%',
      alignItems: 'center',
    },
    bar: {
      width: '80%',
      borderRadius: BorderRadius.sm,
      minHeight: 4,
    },
    barLabel: {
      fontSize: 10,
      color: theme.textMuted,
      marginTop: Spacing.xs,
    },
    barValue: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.textSecondary,
      marginTop: 2,
    },
    // 功能菜单
    menuSection: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    menuCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius["2xl"],
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.7)',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 6,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuIcon: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    menuContent: {
      flex: 1,
    },
    menuTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 2,
    },
    menuSubtitle: {
      fontSize: 13,
      color: theme.textMuted,
    },
    // 危险操作
    dangerSection: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    dangerCard: {
      backgroundColor: '#FFE8EE',
      borderRadius: BorderRadius["2xl"],
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.7)',
    },
    dangerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.xl,
    },
    dangerIcon: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.lg,
      backgroundColor: 'rgba(255,107,138,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    dangerContent: {
      flex: 1,
    },
    dangerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.error,
      marginBottom: 2,
    },
    dangerSubtitle: {
      fontSize: 13,
      color: theme.textMuted,
    },
    // 关于
    aboutSection: {
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
      paddingBottom: Spacing["3xl"],
    },
    aboutText: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: Spacing.sm,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Modal样式
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.backgroundDefault,
      borderTopLeftRadius: BorderRadius["3xl"],
      borderTopRightRadius: BorderRadius["3xl"],
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing["2xl"],
      paddingBottom: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.textPrimary,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.backgroundTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalList: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
    },
    recordItem: {
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    recordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    recordIcon: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    recordName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    recordDate: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: Spacing.xs,
    },
    emptyModal: {
      alignItems: 'center',
      paddingVertical: Spacing["4xl"],
    },
    emptyModalText: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: Spacing.md,
    },
    // 时间选择器
    pickerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      gap: Spacing.xs,
    },
    pickerButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
    },
  });
};
