'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthModal } from '@/lib/auth-modal-context';

const supabase = createClient();

export function useRequireAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { openLogin } = useAuthModal();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        openLogin();
      }
      setUser(user);
      setIsLoading(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) openLogin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading, supabase };
}
