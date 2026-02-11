import { Pin, PinOff } from 'lucide-react';
import PanelCarousel from '@/components/panel-carousel';
import NavPanel from '@/components/panels/l1-nav-panel';
import ConversationsPanel from '@/components/panels/l2-conversations-panel';
import DocsPanel from '@/components/panels/l3-docs-panel';
import { useTheme } from '@/contexts/theme-context';

const panels = [
    { label: 'L1: Navigation', content: <NavPanel /> },
    { label: 'L2: Conversations', content: <ConversationsPanel /> },
    { label: 'L3: Docs', content: <DocsPanel /> },
];

export default function LeftSidebar() {
    const { left, pinSidebar, setPanel } = useTheme();

    return (
        <aside
            className={`sidebar-left sidebar-slide fixed top-0 left-0 z-40 flex h-screen w-[var(--sidebar-width)] flex-col ${
                left.open ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
            }}
        >
            <PanelCarousel
                panels={panels}
                activePanel={left.panel}
                onPanelChange={(i) => setPanel('left', i)}
                side="left"
                headerSlot={
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
