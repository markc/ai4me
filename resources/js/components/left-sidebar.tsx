import { useTheme } from '@/contexts/theme-context';
import PanelCarousel from '@/components/panel-carousel';
import NavPanel from '@/components/panels/nav-panel';
import ConversationsPanel from '@/components/panels/conversations-panel';
import { Pin, PinOff } from 'lucide-react';

const panels = [
    { label: 'Navigation', content: <NavPanel /> },
    { label: 'Conversations', content: <ConversationsPanel /> },
];

export default function LeftSidebar() {
    const { left, pinSidebar, setPanel } = useTheme();

    return (
        <aside
            className={`sidebar-slide fixed top-0 left-0 z-40 flex h-screen w-[var(--sidebar-width)] flex-col border-r ${
                left.open ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
            }}
        >
            <PanelCarousel
                panels={panels}
                activePanel={left.panel}
                onPanelChange={(i) => setPanel('left', i)}
                headerLeft={<div className="w-8" />}
                headerRight={
                    <button
                        onClick={() => pinSidebar('left')}
                        className="hidden rounded p-1 transition-colors hover:bg-background xl:block"
                        style={{ color: left.pinned ? 'var(--scheme-accent)' : 'var(--scheme-fg-muted)' }}
                        aria-label={left.pinned ? 'Unpin sidebar' : 'Pin sidebar'}
                    >
                        {left.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    </button>
                }
            />
        </aside>
    );
}
