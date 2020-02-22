
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { UploadModule } from '@progress/kendo-angular-upload';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Store } from './store';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { PublicModule } from './public/public.module';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: './auth/auth.module#AuthModule',
  },
  {
    path: 'portal',
    loadChildren: './contests/contests.module#ContestsModule',
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
    HttpClientModule,
    PublicModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    Store,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
