import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryFormModule } from '../contests/category-form/category-form.module';
import { PublicContestsService } from './services/public-contest.service';
import { PublicContestComponent } from './components/public-contest/public-contest.component';
import { PublicContestGuardService } from './services/public-contest-guard.service';
import { PublicContestResolver } from './services/public-contest.resolver';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
    {
        path: '',
        children: [
            // { path: '', pathMatch: 'full', redirectTo: 'home' },
            {
                path: ':contest',
                component: PublicContestComponent,
                canActivate: [
                    PublicContestGuardService,
                ],
                resolve: {
                    contest: PublicContestResolver,
                },
            },
        ],
    },
];

@NgModule({
    declarations: [
        PublicContestComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule,
        CommonModule,
        CategoryFormModule,
    ],
    providers: [
        PublicContestsService,
        PublicContestGuardService,
        PublicContestResolver,
    ],
})
export class PublicContestModule {}
