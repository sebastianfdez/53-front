
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UploadModule } from '@progress/kendo-angular-upload';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Store } from 'store';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { PublicModule } from './public/public.module';
import { AppComponent } from './app.component';

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
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
