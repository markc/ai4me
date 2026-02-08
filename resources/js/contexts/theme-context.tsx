import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type ColorScheme = 'crimson' | 'stone' | 'ocean' | 'forest' | 'sunset';
export type ThemeMode = 'light' | 'dark';

type SidebarState = {
    open: boolean;
    pinned: boolean;
};

type ThemeState = {
    theme: ThemeMode;
    scheme: ColorScheme;
    left: SidebarState;
    right: SidebarState;
};

type ThemeContextValue = ThemeState & {
    toggleTheme: () => void;
    setScheme: (scheme: ColorScheme) => void;
    toggleSidebar: (side: 'left' | 'right') => void;
    pinSidebar: (side: 'left' | 'right') => void;
    closeSidebars: () => void;
};

const STORAGE_KEY = 'base-state';

const defaults: ThemeState = {
    theme: 'dark',
    scheme: 'crimson',
    left: { open: false, pinned: false },
    right: { open: false, pinned: false },
};

function loadState(): ThemeState {
    if (typeof window === 'undefined') return defaults;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaults;
        const parsed = JSON.parse(raw);
        return {
            theme: parsed.theme || defaults.theme,
            scheme: parsed.scheme || defaults.scheme,
            left: {
                open: parsed.leftOpen ?? false,
                pinned: parsed.leftPinned ?? false,
            },
            right: {
                open: parsed.rightOpen ?? false,
                pinned: parsed.rightPinned ?? false,
            },
        };
    } catch {
        return defaults;
    }
}

function saveState(state: ThemeState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        theme: state.theme,
        scheme: state.scheme,
        leftOpen: state.left.open,
        leftPinned: state.left.pinned,
        rightOpen: state.right.open,
        rightPinned: state.right.pinned,
    }));
}

function applyThemeToDOM(theme: ThemeMode) {
    const html = document.documentElement;
    html.classList.toggle('dark', theme === 'dark');
    html.style.colorScheme = theme;
}

function applySchemeToDOM(scheme: ColorScheme) {
    const html = document.documentElement;
    ['stone', 'ocean', 'forest', 'sunset'].forEach(s => html.classList.remove(`scheme-${s}`));
    if (scheme !== 'crimson') {
        html.classList.add(`scheme-${scheme}`);
    }
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ThemeState>(loadState);

    // Apply theme and scheme to DOM on mount and changes
    useEffect(() => {
        applyThemeToDOM(state.theme);
        applySchemeToDOM(state.scheme);
        saveState(state);
    }, [state]);

    // Listen for viewport changes — collapse sidebars below 1280px
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1280px)');
        const handler = (e: MediaQueryListEvent) => {
            if (!e.matches) {
                setState(prev => ({
                    ...prev,
                    left: { open: false, pinned: false },
                    right: { open: false, pinned: false },
                }));
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleTheme = useCallback(() => {
        setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
    }, []);

    const setScheme = useCallback((scheme: ColorScheme) => {
        setState(prev => ({ ...prev, scheme }));
    }, []);

    const toggleSidebar = useCallback((side: 'left' | 'right') => {
        setState(prev => {
            const other = side === 'left' ? 'right' : 'left';
            const current = prev[side];
            if (current.open) {
                // Close and unpin
                return { ...prev, [side]: { open: false, pinned: false } };
            }
            // Open this side, close non-pinned other
            const otherState = prev[other].pinned ? prev[other] : { open: false, pinned: false };
            return { ...prev, [side]: { open: true, pinned: current.pinned }, [other]: otherState };
        });
    }, []);

    const pinSidebar = useCallback((side: 'left' | 'right') => {
        setState(prev => {
            const current = prev[side];
            const pinning = !current.pinned;
            return {
                ...prev,
                [side]: { open: pinning, pinned: pinning },
            };
        });
    }, []);

    const closeSidebars = useCallback(() => {
        setState(prev => ({
            ...prev,
            left: prev.left.pinned ? prev.left : { open: false, pinned: false },
            right: prev.right.pinned ? prev.right : { open: false, pinned: false },
        }));
    }, []);

    return (
        <ThemeContext.Provider value={{ ...state, toggleTheme, setScheme, toggleSidebar, pinSidebar, closeSidebars }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
