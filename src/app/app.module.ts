
import {
    NgModule, APP_INITIALIZER, ErrorHandler,
} from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import { UploadModule } from '@progress/kendo-angular-upload';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Store } from 'store';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as Sentry from '@sentry/angular';
import { environment } from '../environments/environment';
import { PublicModule } from './public/public.module';
import { AppComponent } from './app.component';
import { AuthServiceModule } from './auth/auth.module';


const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
    },
    {
        path: 'portal',
        loadChildren: () => import('./contests/contests.module').then((m) => m.ContestsModule),
    },
    {
        path: 'inscription',
        loadChildren: () => import('./inscription/inscription.module').then((m) => m.InscriptionModule),
    },
    {
        path: 'public-contest',
        loadChildren: () => import('./public-contest/public-contest.module').then((m) => m.PublicContestModule),
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
        AuthServiceModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ],
    providers: [
        Store,
        {
            provide: ErrorHandler,
            useValue: Sentry.createErrorHandler({
                showDialog: true,
            }),
        },
        {
            provide: Sentry.TraceService,
            deps: [Router],
        },
        {
            provide: APP_INITIALIZER,
            useFactory: () => () => {},
            deps: [Sentry.TraceService],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
