
import { NgModule, LOCALE_ID } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UploadModule } from '@progress/kendo-angular-upload';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, registerLocaleData, APP_BASE_HREF } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEs from '@angular/common/locales/es';
import { Store } from 'store';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { PublicModule } from './public/public.module';
import { AppComponent } from './app.component';

registerLocaleData(localeFr, 'fr');
registerLocaleData(localeEs, 'es');

function localeBaseHrefFactory(locale: string) {
    return locale === 'en' ? '/en' : `/${locale}`;
}

const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
    },
    {
        path: 'portal',
        loadChildren: () => import('./contests/contests.module').then((m) => m.ContestsModule),
    },
    { path: '**', redirectTo: 'home' },
];

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forRoot(routes),
        UploadModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        PublicModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ],
    providers: [
        Store,
        {
            provide: APP_BASE_HREF,
            useFactory: localeBaseHrefFactory,
            deps: [LOCALE_ID],
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
