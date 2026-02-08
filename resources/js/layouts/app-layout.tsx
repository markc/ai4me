import AppDualSidebarLayout from '@/layouts/app/app-dual-sidebar-layout';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
    return <AppDualSidebarLayout>{children}</AppDualSidebarLayout>;
}
