import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, BookOpen, HelpCircle, Users, UserCircle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

export default function GuruLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="materials"
        options={{
          title: 'Materi',
          tabBarIcon: ({ color, size }) => <BookOpen size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          title: 'Kuis',
          tabBarIcon: ({ color, size }) => <HelpCircle size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Siswa',
          tabBarIcon: ({ color, size }) => <Users size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <UserCircle size={size || 22} color={color} />,
        }}
      />
    </Tabs>
  );
}
