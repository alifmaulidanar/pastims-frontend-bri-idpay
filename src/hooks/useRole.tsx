import supabase from '@/utils/supabase';
import { useEffect, useState } from 'react';
const supabaseLocalStorageSession = import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_SESSION;

export const useRole = () => {
  const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (role) {
        setLoading(false);
        return;
      }

      try {
        const session = localStorage.getItem(supabaseLocalStorageSession);
        if (!session) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error || !data) {
          setLoading(false);
          return;
        }

        const { user } = data.session || {};
        const { data: userRole, error: roleError } = await supabase
          .from('roles')
          .select('role')
          .or(`user_id.eq.${user?.id},admin_id.eq.${user?.id}`)
          .single();

        if (roleError || !userRole) {
          setLoading(false);
          return;
        }

        // Save role to localStorage
        localStorage.setItem('user_role', userRole.role);
        setRole(userRole.role);
      } catch (error) {
        console.error('Error fetching role:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!role) {
      fetchRole();
    } else {
      setLoading(false);
    }
  }, [role]);

  return { role, loading };
};
