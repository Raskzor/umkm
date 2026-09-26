/**
 * Reusable React Hook & Helper Contract: useUserNavigation
 * Ekosistem SuperUMKM — Client-side Dynamic Menu & Quota Resolver for PWA / React App
 */

import { useState, useEffect } from 'react';

export function useUserNavigation(userToken, currentRole) {
  const [navigationState, setNavigationState] = useState({
    loading: true,
    error: null,
    role_code: currentRole || 'UMKM_OWNER_FREE',
    categories: {},
    grouped_menus: {},
    flat_menus: [],
    metadata: {
      staff_limit: 1,
      qris_type: 'STATIC',
      video_access_tier: 'BASIC'
    }
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchNavigation() {
      if (!userToken) return;
      try {
        setNavigationState(prev => ({ ...prev, loading: true }));
        const res = await fetch('/api/v1/users/navigation-menus', {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        const data = await res.json();
        if (isMounted && data.success) {
          setNavigationState({
            loading: false,
            error: null,
            role_code: data.data.role_code,
            tier: data.data.tier,
            categories: data.data.categories,
            grouped_menus: data.data.grouped_menus,
            flat_menus: data.data.flat_menus,
            metadata: data.data.metadata
          });
        }
      } catch (err) {
        if (isMounted) {
          setNavigationState(prev => ({
            ...prev,
            loading: false,
            error: 'Gagal memuat struktur menu navigasi'
          }));
        }
      }
    }

    fetchNavigation();
    return () => { isMounted = false; };
  }, [userToken, currentRole]);

  return navigationState;
}

export default useUserNavigation;
