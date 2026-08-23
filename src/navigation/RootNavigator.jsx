import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';
import useIsAdmin from '../features/admin/hooks/useIsAdmin';
import useAppSettings from '../features/admin/hooks/useAppSettings';
import AuthStack from './AuthStack';
import LearnerStack from './LearnerStack';
import AdminStack from './AdminStack';
import Spinner from '../components/Spinner';
import MaintenanceScreen from '../screens/MaintenanceScreen';

const authLinking = {
  prefixes: ['http://localhost:8081', 'https://sakura-mastery.vercel.app'],
  config: {
    screens: {
      Login: 'login',
      Signup: 'signup',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password',
    },
  },
};

export default function RootNavigator() {
  const { state } = useAuthContext();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const { settings, loading: settingsLoading } = useAppSettings();

  // A password-recovery link (from Supabase's reset email) must always be
  // honored, even if the browser already has an existing logged-in session
  // from previous testing — otherwise the recovery screen is unreachable
  // and the user gets silently dropped onto the Dashboard/Admin panel
  // instead of the password reset form. Checking the PATH (not just a
  // "type=recovery" hash) means this also correctly catches EXPIRED or
  // invalid reset links, which arrive as an error hash instead —
  // those still need to land on ResetPasswordScreen so it can show a
  // proper "link expired" message, rather than silently falling through
  // to the Admin/Learner dashboard.
  const isPasswordRecovery =
    typeof window !== 'undefined' && window.location.pathname.includes('/reset-password');

  if (state.isLoading) {
    return <Spinner fullscreen label="Loading SakuraMastery..." />;
  }

  if (!state.isAuthenticated || isPasswordRecovery) {
    return (
      <NavigationContainer linking={authLinking}>
        <AuthStack />
      </NavigationContainer>
    );
  }

  if (roleLoading || settingsLoading) {
    return <Spinner fullscreen label="Loading SakuraMastery..." />;
  }

  // Admins bypass maintenance mode entirely — they need access to turn it
  // back off. Only learner accounts see the maintenance screen.
  if (settings?.maintenance_mode === true && !isAdmin) {
    return <MaintenanceScreen />;
  }

  return (
    <NavigationContainer>
      {isAdmin ? <AdminStack /> : <LearnerStack />}
    </NavigationContainer>
  );
}