import supabase from '@/utils/supabase';

export const handleLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error };
  }
  return { data };
};
