import { supabase } from './supabaseClient';

export async function loginRequest({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signupRequest({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
  if (error) throw new Error(error.message);
  return data.user;
}

export async function logoutRequest() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function forgotPasswordRequest({ email }) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:8081/reset-password',
  });
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function fetchCurrentUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('No active session');
  return data.session.user;
}