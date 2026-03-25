import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    container: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    // Hero区域
    heroContainer: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl,
      borderRadius: BorderRadius["3xl"],
      overflow: 'hidden',
      backgroundColor: theme.primary,
      paddingHorizontal: Spacing["2xl"],
      paddingVertical: Spacing["4xl"],
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.25)',
      // 黏土风阴影
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 10,
    },
    heroTitle: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
    },
    heroSubtitle: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 14,
      fontWeight: '500',
      marginTop: Spacing.sm,
      textAlign: 'center',
    },
    // 统计卡片区域
    statsContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius["2xl"],
      padding: Spacing.lg,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.7)',
      // 黏土风阴影
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
      marginBottom: Spacing.xs,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textMuted,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.textPrimary,
      marginBottom: Spacing.lg,
    },
    // 最近记录
    recentSection: {
      paddingHorizontal: Spacing.lg,
    },
    recentCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius["2xl"],
      padding: Spacing.xl,
      marginBottom: Spacing.md,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.7)',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 6,
    },
    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    recentItemIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.7)',
    },
    recentItemText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    recentItemMeta: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: Spacing["3xl"],
    },
    emptyText: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: Spacing.md,
    },
  });
};
