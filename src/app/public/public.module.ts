import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HomeComponent } from './home/home.component';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { CarouselComponent } from './carousel/carousel.component';
import { NewsComponent } from './news/news.component';
import { DescriptionOverviewComponent } from './description-overview/description-overview.component';
import { DescriptionOverviewResolve } from './description-overview/description-overview.resolve';
import { FirebaseModule } from '../shared/firebase.module';
import { AnimationService } from './services/animation.service';

const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        data: {
            title: {
                text: 'La 53 - Home',
            },
        },
    },
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
        CommonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterModule.forChild(routes),
        FirebaseModule,
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
        AnimationService,
    ],
    exports: [
        RouterModule,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
})
export class PublicModule { }
