import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

type PanelDef = {
    label: string;
    content: ReactNode;
};

type PanelCarouselProps = {
    panels: PanelDef[];
    activePanel: number;
    onPanelChange: (index: number) => void;
    headerLeft?: ReactNode;
    headerRight?: ReactNode;
};

export default function PanelCarousel({ panels, activePanel, onPanelChange, headerLeft, headerRight }: PanelCarouselProps) {
    const canPrev = activePanel > 0;
    const canNext = activePanel < panels.length - 1;

    return (
        <>
            {/* Header */}
            <div className="flex h-[var(--topnav-height)] shrink-0 items-center border-b px-3" style={{ borderColor: 'var(--glass-border)' }}>
                {headerLeft}
                <div className="flex flex-1 items-center justify-center gap-1.5">
                    <button
                        onClick={() => canPrev && onPanelChange(activePanel - 1)}
                        className="rounded p-0.5 transition-colors hover:bg-background"
                        style={{ color: canPrev ? 'var(--scheme-fg-muted)' : 'transparent', cursor: canPrev ? 'pointer' : 'default' }}
                        aria-label="Previous panel"
                        tabIndex={canPrev ? 0 : -1}
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5">
                        {panels.map((p, i) => (
                            <button
                                key={p.label}
                                onClick={() => onPanelChange(i)}
                                className="transition-all"
                                style={{
                                    width: i === activePanel ? 16 : 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: i === activePanel ? 'var(--scheme-accent)' : 'var(--scheme-fg-muted)',
                                    opacity: i === activePanel ? 1 : 0.4,
                                }}
                                aria-label={p.label}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => canNext && onPanelChange(activePanel + 1)}
                        className="rounded p-0.5 transition-colors hover:bg-background"
                        style={{ color: canNext ? 'var(--scheme-fg-muted)' : 'transparent', cursor: canNext ? 'pointer' : 'default' }}
                        aria-label="Next panel"
                        tabIndex={canNext ? 0 : -1}
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
                {headerRight}
            </div>

            {/* Panel viewport */}
            <div className="relative flex-1 overflow-hidden">
                <div
                    className="flex h-full transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${activePanel * 100}%)` }}
                >
                    {panels.map((p) => (
                        <div key={p.label} className="h-full w-full shrink-0 overflow-y-auto">
                            {p.content}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
