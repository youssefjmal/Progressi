import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/lib/language-context'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { BottomNavWrapper } from '@/components/navigation/bottom-nav-wrapper'
import { SidebarWrapper } from '@/components/navigation/sidebar-wrapper'
import { TopSettingsBar } from '@/components/navigation/top-settings-bar'
import { AuthModalProvider } from '@/lib/auth-modal-context'
import { AuthModal } from '@/components/auth/auth-modal'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'wakelni - AI Fitness Coach',
  description: 'Your bilingual AI-powered fitness coaching app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthModalProvider>
              <div className="flex min-h-screen items-start">
                <SidebarWrapper />
                <div className="flex-1 min-w-0 pb-20 md:pb-0">
                  {children}
                </div>
              </div>
              <BottomNavWrapper />
              <TopSettingsBar />
              <AuthModal />
            </AuthModalProvider>
          </LanguageProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
