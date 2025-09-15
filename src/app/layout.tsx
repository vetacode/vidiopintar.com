import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] })

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Vidiopintar - Turn YouTube into Your Personal Learning Academy",
  description: "Learn from YouTube videos with ai chat, note-taking, and quizz",
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Get the locale from the configuration (which reads from cookies)
  const locale = await getLocale();
  
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <Script
        src="https://vince.ngooding.com/js/script.js"
        data-domain="vidiopintar.com"
        strategy="afterInteractive"
      />
      <body className={`${inter.className} ${jetbrainsMono.variable} dark`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="vidiopintar-theme">
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}