import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import AppLayout from '@/layouts/app-layout';
import type { ReactNode } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'ai4me';

const defaultLayout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: async (name) => {
            const page = await resolvePageComponent(
                `./pages/${name}.tsx`,
                import.meta.glob('./pages/**/*.tsx'),
            );
            if (!(page as any).default.layout && !name.startsWith('auth/') && name !== 'welcome') {
                (page as any).default.layout = defaultLayout;
            }
            return page;
        },
        setup: ({ App, props }) => <App {...props} />,
    }),
);
