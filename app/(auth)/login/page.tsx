'use client'

import Link from 'next/link'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/')
      }
    })
    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, router])

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/')
      }
    }
    getUser()
  }, [supabase, router])

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="max-w-92 m-auto h-fit w-full">
        <div className="p-6">
          <div className='text-center'>
            <h1 className="mb-1 mt-4 font-semibold">Sign In to Vidiopintar</h1>
            <p className="mb-8">Welcome back! Sign in to continue</p>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            onlyThirdPartyProviders
            redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
          />
        </div>

        <p className="text-accent-foreground text-center text-sm">
          Don't have an account ?
          <Button
            asChild
            variant="link"
            className="px-2">
            <Link href="/signup">Create account</Link>
          </Button>
        </p>
      </div>
    </section>
  )
}
