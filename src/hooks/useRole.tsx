import supabase from '@/utils/supabase';
import { useEffect, useState } from 'react';

export const useRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error('Session error or no session found', sessionError);
          setLoading(false);
          return;
        }

        const user_id = session.session?.user.id;
        const { data: userRole, error: roleError } = await supabase
          .from('roles')
          .select('role')
          .eq('user_id', user_id)
          .single();

        if (roleError || !userRole) {
          console.error('Role not found for this user', roleError);
          setLoading(false);
          return;
        }
        setRole(userRole.role);
      } catch (error) {
        console.error('Error fetching role:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  return { role, loading };
};
