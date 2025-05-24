// store/authStore.ts
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Initially true until the first auth check completes
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}))

// Function to initialize auth state, can be called in a root layout or provider
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export async function initializeAuthStore() {
  const supabase = createSupabaseBrowserClient()
  useAuthStore.getState().setLoading(true)
  try {
    const { data: { user } } = await supabase.auth.getUser()
    useAuthStore.getState().setUser(user)

    // Listen to auth changes to keep the store in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setUser(session?.user ?? null)
    })

    // It's good practice to return the subscription so it can be cleaned up if needed,
    // though for a global store listener, it might live for the app's lifetime.
    return subscription
  } catch (error) {
    console.error('Error initializing auth store:', error)
    useAuthStore.getState().setUser(null) // Ensure user is null on error
  } finally {
    useAuthStore.getState().setLoading(false)
  }
}
