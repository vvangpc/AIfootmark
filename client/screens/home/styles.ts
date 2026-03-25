import { StyleSheet, Dimensions } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

// 获取屏幕尺寸用于响应式布局
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

export const createStyles = (theme: Theme, topInset: number = 0) => {
  // Hero区域高度 = 基础高度 + 顶部安全区
  const heroHeight = (isSmallScreen ? 100 : 120) + topInset;
  
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    container: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    // Hero区域 - 使用层叠布局
    heroContainer: {
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      borderRadius: BorderRadius["3xl"],
      overflow: 'hidden',
      backgroundColor: theme.primary,
      height: heroHeight,
      position: 'relative',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.25)',
      // 黏土风阴影
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 10,
    },
    // 背景装饰层
    heroBgDecor: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.primary,
    },
    // 文字层 - 悬浮在上层
    heroContent: {
      position: 'absolute',
      top: topInset + 20,  // 安全区 + 额外间距
      left: 0,
      right: 0,
      bottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      paddingHorizontal: Spacing.md,
    },
    heroTitle: {
      color: '#FFFFFF',
      fontWeight: '800',
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    // 统计卡片区域
    statsContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: isSmallScreen ? Spacing.sm : Spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.backgroundDefault,
      borderRadius: isSmallScreen ? BorderRadius.xl : BorderRadius["2xl"],
      padding: isSmallScreen ? Spacing.md : Spacing.lg,
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
      width: isSmallScreen ? 40 : 48,
      height: isSmallScreen ? 40 : 48,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isSmallScreen ? Spacing.sm : Spacing.md,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.7)',
    },
    statNumber: {
      fontSize: isSmallScreen ? 26 : 32,
      fontWeight: '800',
      marginBottom: Spacing.xs,
    },
    statLabel: {
      fontSize: isSmallScreen ? 11 : 12,
      fontWeight: '700',
      color: theme.textMuted,
      textAlign: 'center',
      // 确保文字完整显示
      includeFontPadding: false,
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
