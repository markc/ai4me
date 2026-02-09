import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import LeftSidebar from '@/components/left-sidebar';
import RightSidebar from '@/components/right-sidebar';
import TopNav from '@/components/top-nav';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';

function LayoutContent({ children }: { children: ReactNode }) {
    const { left, right, noPadding, toggleSidebar } = useTheme();

    return (
        <div className="bg-background text-foreground">
            {/* Fixed hamburger icons — always visible at top corners */}
            <button
                onClick={() => toggleSidebar('left')}
                className="fixed top-3 left-3 z-50 rounded-lg p-1.5 text-foreground transition-colors hover:text-[var(--scheme-accent)]"
                style={{
                    background: 'var(--glass)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                }}
                aria-label="Toggle left sidebar"
            >
                <Menu className="h-5 w-5" />
            </button>
            <button
                onClick={() => toggleSidebar('right')}
                className="fixed top-3 right-3 z-50 rounded-lg p-1.5 text-foreground transition-colors hover:text-[var(--scheme-accent)]"
                style={{
                    background: 'var(--glass)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                }}
                aria-label="Toggle right sidebar"
            >
                <Menu className="h-5 w-5" />
            </button>

            <LeftSidebar />
            <RightSidebar />

            {/* TopNav — full width, viewport-centered title, only on scrollable pages */}
            {!noPadding && <TopNav />}

            <div
                className={`sidebar-slide ${noPadding ? 'h-screen overflow-hidden' : ''}`}
                style={{
                    marginInlineStart: left.pinned ? 'var(--sidebar-width)' : undefined,
                    marginInlineEnd: right.pinned ? 'var(--sidebar-width)' : undefined,
                }}
            >
                <main className={noPadding ? 'h-full' : 'p-4'}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AppDualSidebarLayout({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <LayoutContent>{children}</LayoutContent>
        </ThemeProvider>
    );
}
