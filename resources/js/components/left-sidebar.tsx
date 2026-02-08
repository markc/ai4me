import { useTheme } from '@/contexts/theme-context';
import { Link, usePage } from '@inertiajs/react';
import { Home, MessageSquare, Pin, PinOff, Users } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/users', label: 'Users', icon: Users },
];

export default function LeftSidebar() {
    const { left, pinSidebar } = useTheme();
    const { url } = usePage();

    return (
        <aside
            className={`sidebar-slide fixed top-0 left-0 z-40 flex h-screen w-[var(--sidebar-width)] flex-col overflow-y-auto border-r ${
                left.open ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
            }}
        >
            <div className="flex h-[var(--topnav-height)] shrink-0 items-center border-b px-3" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="w-8" />
                <span className="flex-1 text-center text-sm" style={{ color: 'var(--scheme-fg-muted)' }}>Navigation</span>
                <button
                    onClick={() => pinSidebar('left')}
                    className="hidden rounded p-1 transition-colors hover:bg-background xl:block"
                    style={{ color: left.pinned ? 'var(--scheme-accent)' : 'var(--scheme-fg-muted)' }}
                    aria-label={left.pinned ? 'Unpin sidebar' : 'Pin sidebar'}
                >
                    {left.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                </button>
            </div>

            <nav className="flex flex-col py-2">
                {navItems.map(item => {
                    const isActive = url.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            className={`flex items-center gap-3 border-l-[3px] px-3 py-2 text-sm transition-colors ${
                                isActive
                                    ? 'border-[var(--scheme-accent)] bg-background text-[var(--scheme-accent)]'
                                    : 'border-transparent hover:border-muted-foreground hover:bg-background'
                            }`}
                            style={{ color: isActive ? 'var(--scheme-accent)' : undefined }}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
