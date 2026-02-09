import { Link, usePage } from '@inertiajs/react';
import { Home, MessageSquare, Users } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/users', label: 'Users', icon: Users },
];

export default function NavPanel() {
    const { url } = usePage();

    return (
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
    );
}
