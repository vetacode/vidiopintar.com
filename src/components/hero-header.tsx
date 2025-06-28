"use client"

import { Menu, X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export const HeroHeader = () => {
    const [menuState, setMenuState] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const pathname = usePathname()
    const isHome = pathname === '/'
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check localStorage for authentication status
        const auth = localStorage.getItem('isAuthenticated');
        try {
            const parsed = auth ? JSON.parse(auth) : null;
            setIsAuthenticated(parsed?.authenticated === true);
        } catch {
            setIsAuthenticated(false);
        }

        // Listen for changes in localStorage from other tabs/windows
        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'isAuthenticated') {
                setIsAuthenticated(event.newValue === 'true');
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleLogout = async () => {
        await authClient.signOut();
        localStorage.setItem('isAuthenticated', JSON.stringify({ authenticated: false }));
        setIsAuthenticated(false);
        router.push("/");
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2">
                <div className={cn('mx-auto mt-2 px-6 transition-all duration-300 lg:px-12 max-w-5xl', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <a
                                href="/home"
                                aria-label="home"
                                className="flex items-center space-x-2 tracking-tight">
                                Vidiopintar
                            </a>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                {isHome ? (
                                    <>
                                        {isAuthenticated ? (
                                            <a href="/home">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 cursor-pointer">
                                                    <span>Home</span>
                                                </Button>
                                            </a>
                                        ) : (
                                            <>
                                                <a href="/login">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                        className={cn(isScrolled && 'lg:hidden')}>
                                                        <span>Login</span>
                                                    </Button>
                                                </a>
                                                <a href="/register">
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        className={cn(isScrolled && 'lg:hidden')}>
                                                        <span>Sign Up</span>
                                                    </Button>
                                                </a>
                                                <a href="/home">
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                                        <span>Get Started</span>
                                                    </Button>
                                                </a>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <Button
                                        onClick={handleLogout}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 cursor-pointer">
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
