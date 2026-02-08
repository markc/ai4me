import { useTheme } from '@/contexts/theme-context';
import { Menu, Moon, Sun } from 'lucide-react';

export default function TopNav() {
    const { theme, toggleTheme, toggleSidebar } = useTheme();

    return (
        <header
            className="fixed top-0 right-0 left-0 z-40 flex h-[var(--topnav-height)] items-center justify-between border-b px-4"
            style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
            }}
        >
            <button
                onClick={() => toggleSidebar('left')}
                className="p-1 text-2xl text-foreground hover:text-[var(--scheme-accent)]"
                aria-label="Toggle left sidebar"
            >
                <Menu className="h-5 w-5" />
            </button>

            <h1 className="text-xl font-bold tracking-tight">
                <span className="text-foreground">ai</span>
                <span style={{ color: 'var(--scheme-accent)' }}>4me</span>
            </h1>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-1 transition-transform hover:scale-110"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'dark' ? (
                        <Sun className="h-5 w-5 text-foreground" />
                    ) : (
                        <Moon className="h-5 w-5 text-foreground" />
                    )}
                </button>
                <button
                    onClick={() => toggleSidebar('right')}
                    className="p-1 text-2xl text-foreground hover:text-[var(--scheme-accent)]"
                    aria-label="Toggle right sidebar"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
