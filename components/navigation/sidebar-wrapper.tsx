'use client';

import { Sidebar } from './sidebar';
import { usePathname } from 'next/navigation';

// Don't show sidebar on landing/auth pages
const HIDDEN_PATHS = ['/', '/auth/login', '/auth/sign-up', '/auth/signup'];

export function SidebarWrapper() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith('/auth'))) return null;
  return <Sidebar />;
}
