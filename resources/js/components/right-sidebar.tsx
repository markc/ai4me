import { useTheme } from '@/contexts/theme-context';
import PanelCarousel from '@/components/panel-carousel';
import ThemePanel from '@/components/panels/theme-panel';
import UsagePanel from '@/components/panels/usage-panel';
import { Pin, PinOff } from 'lucide-react';

const panels = [
    { label: 'Theme', content: <ThemePanel /> },
    { label: 'Usage', content: <UsagePanel /> },
];

export default function RightSidebar() {
    const { right, pinSidebar, setPanel } = useTheme();

    return (
        <aside
            className={`sidebar-slide fixed top-0 right-0 z-40 flex h-screen w-[var(--sidebar-width)] flex-col border-l ${
                right.open ? 'translate-x-0' : 'translate-x-full'
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
                activePanel={right.panel}
                onPanelChange={(i) => setPanel('right', i)}
                headerLeft={
                    <button
                        onClick={() => pinSidebar('right')}
                        className="hidden rounded p-1 transition-colors hover:bg-background xl:block"
                        style={{ color: right.pinned ? 'var(--scheme-accent)' : 'var(--scheme-fg-muted)' }}
                        aria-label={right.pinned ? 'Unpin sidebar' : 'Pin sidebar'}
                    >
                        {right.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    </button>
                }
                headerRight={<div className="w-8" />}
            />
        </aside>
    );
}
