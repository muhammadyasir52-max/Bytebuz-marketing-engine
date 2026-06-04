import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0A0A1A',
  primary: '#7C3AED',
  inactive: '#606080',
  border: '#2A2A45',
};

type IoniconsName = keyof typeof Ionicons.glyphMap;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={(focused ? 'home' : 'home-outline') as IoniconsName}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: 'Generate',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={(focused ? 'flash' : 'flash-outline') as IoniconsName}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="automation"
        options={{
          title: 'Automate',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={(focused ? 'git-branch' : 'git-branch-outline') as IoniconsName}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={(focused ? 'bar-chart' : 'bar-chart-outline') as IoniconsName}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={(focused ? 'settings' : 'settings-outline') as IoniconsName}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
