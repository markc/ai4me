import LeftSidebar from '@/components/left-sidebar';
import Overlay from '@/components/overlay';
import RightSidebar from '@/components/right-sidebar';
import TopNav from '@/components/top-nav';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';
import type { ReactNode } from 'react';

function LayoutContent({ children, noPadding }: { children: ReactNode; noPadding?: boolean }) {
    const { left, right } = useTheme();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <TopNav />
            <LeftSidebar />
            <RightSidebar />
            <Overlay />

            <main
                className={`sidebar-slide mt-[var(--topnav-height)] min-h-[calc(100vh-var(--topnav-height))] ${noPadding ? '' : 'p-4'}`}
                style={{
                    marginInlineStart: left.pinned ? 'var(--sidebar-width)' : undefined,
                    marginInlineEnd: right.pinned ? 'var(--sidebar-width)' : undefined,
                }}
            >
                {children}
            </main>
        </div>
    );
}

export default function AppDualSidebarLayout({ children, noPadding }: { children: ReactNode; noPadding?: boolean }) {
    return (
        <ThemeProvider>
            <LayoutContent noPadding={noPadding}>{children}</LayoutContent>
        </ThemeProvider>
    );
}
