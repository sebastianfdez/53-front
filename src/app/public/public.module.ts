import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { CarouselComponent } from './carousel/carousel.component';
import { NewsComponent } from './news/news.component';
import { DescriptionOverviewComponent } from './description-overview/description-overview.component';
import { DescriptionOverviewResolve } from './description-overview/description-overview.resolve';
import { AnimationService } from './services/animation.service';
import { MinimalMaterialModule } from '../shared/minimal-material.module';
import { LanguagesModule } from '../language/languages.module';

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
        MinimalMaterialModule,
        LanguagesModule,
        RouterModule.forChild(routes),
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
