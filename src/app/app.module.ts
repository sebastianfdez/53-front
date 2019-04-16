
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { ContestsModule } from './contests/contests.module';
import { SharedModule } from '@progress/kendo-angular-dropdowns';
import { PublicModule } from './public/public.module';

const routes: Routes = [

];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    SharedModule,
    ContestsModule,
    PublicModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
