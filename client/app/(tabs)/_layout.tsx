import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.backgroundDefault,
        borderTopColor: 'transparent',
        // 移动端：标准高度 50px + 底部安全区
        // Web端：固定60px，无需安全区
        height: Platform.OS === 'web' ? 60 : 50 + insets.bottom,
        // 移动端：内容区域底部 padding 防止内容被遮挡
        paddingBottom: Platform.OS === 'web' ? 0 : insets.bottom,
        // 黏土风底部导航栏样式
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        // 黏土风阴影
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 0,
      },
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: '#C5C0DB',
      tabBarItemStyle: {
        // Web 兼容性强制规范：Web 端必须显式指定 item 高度
        height: Platform.OS === 'web' ? 60 : undefined,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 4,
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={20} color={color} solid />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: '心愿清单',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="heart" size={20} color={color} solid />
          ),
        }}
      />
      <Tabs.Screen
        name="footprints"
        options={{
          title: '足迹地图',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="shoe-prints" size={20} color={color} solid />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user" size={20} color={color} solid />
          ),
        }}
      />
    </Tabs>
  );
}
