import AppDualSidebarLayout from '@/layouts/app/app-dual-sidebar-layout';
import type { ReactNode } from 'react';

export default function AppLayout({ children, noPadding }: { children: ReactNode; noPadding?: boolean }) {
    return <AppDualSidebarLayout noPadding={noPadding}>{children}</AppDualSidebarLayout>;
}
