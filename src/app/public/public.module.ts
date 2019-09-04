import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule, Routes, Router } from '@angular/router';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { CarouselComponent } from './carousel/carousel.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { NewsComponent } from './news/news.component';
import { DescriptionOverviewComponent } from './description-overview/description-overview.component';
import { DescriptionOverviewResolve } from './description-overview/description-overview.resolve';

const routes: Routes = [
  { path: 'home', children: [
    { path: '', component: HomeComponent },
    { path: ':type', component: DescriptionOverviewComponent, resolve: {
      template: DescriptionOverviewResolve
    }},
  ]},
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    SharedModule,
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
  ]
})
export class PublicModule { }
