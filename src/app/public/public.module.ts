import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HomeComponent } from './home/home.component';
import { CarouselComponent } from './carousel/carousel.component';
import { NewsComponent } from './news/news.component';
import { DescriptionOverviewComponent } from './description-overview/description-overview.component';
import { DescriptionOverviewResolve } from './description-overview/description-overview.resolve';
import { FirebaseModule } from '../shared/firebase.module';
import { AnimationService } from './services/animation.service';
import { TopMenuModule } from './top-menu/top-menu.module';
import { SnackBarService } from '../shared/services/snack-bar.service';

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
        MatProgressSpinnerModule,
        MatButtonModule,
        MatSnackBarModule,
        RouterModule.forChild(routes),
        FirebaseModule,
        TopMenuModule,
    ],
    declarations: [
        HomeComponent,
        CarouselComponent,
        NewsComponent,
        DescriptionOverviewComponent,
    ],
    providers: [
        DescriptionOverviewResolve,
        AnimationService,
        SnackBarService,
    ],
    exports: [
        RouterModule,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
})
export class PublicModule { }
