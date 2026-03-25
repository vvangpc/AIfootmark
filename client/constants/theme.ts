export const Colors = {
  light: {
    // 3D 黏土风配色
    textPrimary: "#2D2B3D", // 深紫灰
    textSecondary: "#5A5673", // 中紫灰
    textMuted: "#8B87A0", // 浅紫灰
    primary: "#7C5CFC", // 黏土紫（主色）
    accent: "#FF8FAB", // 黏土粉（点缀色）
    success: "#5ED6A0", // 黏土绿
    error: "#FF6B8A", // 黏土红
    backgroundRoot: "#F0EDFA", // 浅薰衣草灰
    backgroundDefault: "#FFFFFF", // 纯白卡片背景
    backgroundTertiary: "#EDE8FF", // 浅紫背景
    buttonPrimaryText: "#FFFFFF",
    tabIconSelected: "#7C5CFC",
    border: "#E5E0F5", // 紫调边框
    borderLight: "#F5F2FA", // 浅紫边框
    // 黏土风扩展色
    clayYellow: "#FFCB57", // 黏土黄
    clayPink: "#FF8FAB", // 黏土粉
    clayGreen: "#5ED6A0", // 黏土绿
    clayBlue: "#7EB8FF", // 黏土蓝
    clayOrange: "#FFB088", // 黏土橙
  },
  dark: {
    textPrimary: "#FAFAF9",
    textSecondary: "#C5C0DB",
    textMuted: "#9B95B8",
    primary: "#9D7FFF", // 暗色模式黏土紫
    accent: "#FFA8BA", // 暗色模式黏土粉
    success: "#6FE0AD",
    error: "#FF8094",
    backgroundRoot: "#1A1826", // 深紫灰背景
    backgroundDefault: "#2D2B3D", // 深紫灰卡片
    backgroundTertiary: "#3A374E", // 三级背景
    buttonPrimaryText: "#2D2B3D",
    tabIconSelected: "#9D7FFF",
    border: "#4A4660",
    borderLight: "#3A374E",
    // 黏土风扩展色
    clayYellow: "#FFCB57",
    clayPink: "#FF8FAB",
    clayGreen: "#5ED6A0",
    clayBlue: "#7EB8FF",
    clayOrange: "#FFB088",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24, // 黏土风标准圆角
  "3xl": 28,
  "4xl": 32,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 112,
    lineHeight: 112,
    fontWeight: "200" as const,
    letterSpacing: -4,
  },
  displayLarge: {
    fontSize: 112,
    lineHeight: 112,
    fontWeight: "200" as const,
    letterSpacing: -2,
  },
  displayMedium: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "200" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800" as const, // 黏土风粗圆字重
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700" as const,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  smallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700" as const, // 黏土风标签用粗体
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700" as const,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700" as const,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  labelTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800" as const,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const,
  },
  stat: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700" as const, // 黏土风统计数字用粗体
  },
  tiny: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "500" as const,
  },
  navLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700" as const, // 黏土风导航标签用粗体
  },
};

export type Theme = typeof Colors.light;
