import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { CarouselComponent } from './carousel/carousel.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NewsComponent } from './news/news.component';
import { DescriptionOverviewComponent } from './description-overview/description-overview.component';
import { DescriptionOverviewResolve } from './description-overview/description-overview.resolve';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatProgressSpinnerModule } from '@angular/material';

const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'home/:type', component: DescriptionOverviewComponent, resolve: {
      template: DescriptionOverviewResolve
    }},
];

@NgModule({
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
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
    RouterModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class PublicModule { }
