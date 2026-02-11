import { Menu } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import LeftSidebar from '@/components/left-sidebar';
import RightSidebar from '@/components/right-sidebar';
import TopNav from '@/components/top-nav';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';

function LayoutContent({ children }: { children: ReactNode }) {
    const { left, right, noPadding, toggleSidebar } = useTheme();

    // Scroll-reactive sidebar borders
    useEffect(() => {
        const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 0);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="bg-background text-foreground">
            {/* Fixed hamburger icons — always visible at top corners */}
            <button
                onClick={() => toggleSidebar('left')}
                className="fixed top-[0.625rem] left-3 z-50 rounded-lg p-1.5 text-foreground transition-colors hover:text-[var(--scheme-accent)]"
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
                className="fixed top-[0.625rem] right-3 z-50 rounded-lg p-1.5 text-foreground transition-colors hover:text-[var(--scheme-accent)]"
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

            <TopNav />

            <div
                className={`sidebar-slide ${noPadding ? '' : 'min-h-screen'}`}
                style={{
                    marginInlineStart: left.pinned ? 'var(--sidebar-width)' : undefined,
                    marginInlineEnd: right.pinned ? 'var(--sidebar-width)' : undefined,
                }}
            >
                <main className={noPadding ? '' : 'px-2 py-4 sm:p-4'}>
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
