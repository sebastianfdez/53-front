import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';
import { FlexLayoutServerModule } from '@angular/flex-layout/server';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';

@NgModule({
    imports: [
        AppModule,
        ServerModule,
        NoopAnimationsModule,
        FlexLayoutServerModule,
        ModuleMapLoaderModule,
    ],
    bootstrap: [
        AppComponent,
    ],
})
export class AppServerModule {}
