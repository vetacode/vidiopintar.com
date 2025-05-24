'use client'

import { useEffect } from 'react'
import { initializeAuthStore } from '@/store/authStore'
import type { Subscription } from '@supabase/supabase-js'

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let subscription: Subscription | undefined | null;

    async function initAuth() {
      subscription = await initializeAuthStore()
    }

    initAuth()

    // Cleanup subscription on component unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return <>{children}</>
}
