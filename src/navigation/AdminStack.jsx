import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminShell from '../features/admin/ui/AdminShell';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminShell" component={AdminShell} />
    </Stack.Navigator>
  );
}