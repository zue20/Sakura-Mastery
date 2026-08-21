import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LogoutButton from '../../../components/LogoutButton';
import AdminTabs from './components/AdminTabs';
import QuestionsPanel from './QuestionsPanel';
import UsersPanel from './UsersPanel';
import BulkToolsPanel from './BulkToolsPanel';
import { COLORS, FONTS } from '../../dashboard/theme';

export default function AdminDashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('questions');

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>🎏🎐 Admin Panel</Text>
        <View style={styles.headerActions}>
          <LogoutButton />
          <Pressable style={styles.backLink} onPress={() => navigation?.goBack()}>
            <Text style={styles.backLinkText}>← Back to Dashboard</Text>
          </Pressable>
        </View>
      </View>

      <AdminTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'questions' && <QuestionsPanel />}
      {activeTab === 'users' && <UsersPanel />}
      {activeTab === 'bulk' && <BulkToolsPanel />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  title: { fontFamily: FONTS.display, fontSize: 20, fontWeight: '700', color: COLORS.deep },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backLink: { paddingVertical: 6, paddingHorizontal: 10 },
  backLinkText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '600' },
});