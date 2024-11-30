import supabase from '@/utils/supabase';

export const handleLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error };
  }
  return { data };
};

export const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error.message);
  } else {
    console.log("User logged out successfully");
    window.location.href = '/';
  }
};