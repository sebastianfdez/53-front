import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { RouterModule, Routes, Router } from '@angular/router';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { CarouselComponent } from './carousel/carousel.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NewsComponent } from './news/news.component';
import { DescriptionOverviewComponent } from './description-overview/description-overview.component';
import { DescriptionOverviewResolve } from './description-overview/description-overview.resolve';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  { path: '', children: [
    { path: '', component: HomeComponent },
    { path: ':type', component: DescriptionOverviewComponent, resolve: {
      template: DescriptionOverviewResolve
    }},
  ]},
];

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
  ],
  declarations: [
    HomeComponent,
    TopMenuComponent,
    CarouselComponent,
    NewsComponent,
    DescriptionOverviewComponent
  ],
  providers: [
    DescriptionOverviewResolve,
  ],
  exports: [
    HomeComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class PublicModule { }
