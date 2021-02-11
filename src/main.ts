import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';
import { AppModule } from './app/app.module';
// import { environment } from './environments/environment';

Sentry.init({
    dsn: 'https://2c53857c29684cdd9af69cd920724c4d@o441770.ingest.sentry.io/5412476',
    integrations: [
        new Integrations.BrowserTracing({
            tracingOrigins: ['localhost', 'https://la53.fr'],
            routingInstrumentation: Sentry.routingInstrumentation,
        }),
    ],
    tracesSampleRate: 1.0,
    release: `la53@${process.env.npm_package_version}`,
});

enableProdMode();

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch((err) => console.error(err));
