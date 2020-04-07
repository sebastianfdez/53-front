import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HomeComponent } from './home/home.component';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { CarouselComponent } from './carousel/carousel.component';
import { NewsComponent } from './news/news.component';
import { DescriptionOverviewComponent } from './description-overview/description-overview.component';
import { DescriptionOverviewResolve } from './description-overview/description-overview.resolve';

const routes: Routes = [
    { path: 'home', component: HomeComponent },
    {
        path: 'home/:type',
        component: DescriptionOverviewComponent,
        resolve: {
            template: DescriptionOverviewResolve,
        },
    },
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
        DescriptionOverviewComponent,
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
