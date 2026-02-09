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
    const len = panels.length;
    const prev = (activePanel - 1 + len) % len;
    const next = (activePanel + 1) % len;

    return (
        <>
            {/* Header */}
            <div className="flex h-[var(--topnav-height)] shrink-0 items-center border-b px-3" style={{ borderColor: 'var(--glass-border)' }}>
                {headerLeft}
                <div className="flex flex-1 items-center justify-center gap-1.5">
                    <button
                        onClick={() => onPanelChange(prev)}
                        className="rounded p-0.5 transition-colors hover:bg-background"
                        style={{ color: 'var(--scheme-fg-muted)' }}
                        aria-label="Previous panel"
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
                        onClick={() => onPanelChange(next)}
                        className="rounded p-0.5 transition-colors hover:bg-background"
                        style={{ color: 'var(--scheme-fg-muted)' }}
                        aria-label="Next panel"
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
