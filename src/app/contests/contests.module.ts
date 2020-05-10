import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { UploadModule } from '@progress/kendo-angular-upload';
import { SharedModule } from '../shared/shared.module';

// Components
import { ContestsComponent } from './components/contests/contests.component';
import { AdminComponent } from './components/admin/admin.component';
import { CategorieComponent } from './components/categorie/categorie.component';
import { ScoreTableComponent } from './components/score-table/score-table.component';
import { JudgesComponent } from './components/judges/judges.component';
import { SpeakerComponent } from './components/speaker/speaker.component';
import { PortalComponent } from './components/portal/portal.component';
import { PoolFormComponent } from './components/pool-form/pool-form.component';
import { PlayerFormComponent } from './components/player-form/player-form.component';
import { AuthModule } from '../auth/auth.module';

// Services
import { AuthGuardService } from '../auth/auth-form/services/auth-guard.service';
import { AdminAuthGuardService } from './services/admin-guard.service';
import { JudgeAuthGuardService } from './services/judge-guard.service';
import { CategorieResolve } from './resolvers/categorie.resolve';
import { JudgeResolve } from './resolvers/judge.resolve';
import { ContestsService } from './services/contest.service';
import { SelectedContestGuardService } from './services/selected-contest-guard.service';
import { ExcelHelperService } from './services/excel-helper.service';
import { AuthFormModule } from '../auth/auth-form/auth-form.module';
import { NewContestComponent } from './components/new-contest/new-contest.component';

const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'portal' },
            { path: 'portal', component: PortalComponent, canActivate: [AuthGuardService] },
            {
                path: 'contests',
                component: ContestsComponent,
                canActivate: [JudgeAuthGuardService, SelectedContestGuardService],
            },
            { path: 'admin', component: AdminComponent, canActivate: [AuthGuardService, SelectedContestGuardService] },
            {
                path: 'judges',
                component: JudgesComponent,
                canActivate: [AdminAuthGuardService, SelectedContestGuardService],
                resolve: {
                    judges: JudgeResolve,
                },
            },
            { path: 'new', component: NewContestComponent, canActivate: [AuthGuardService, SelectedContestGuardService] },
            { path: 'speaker', component: ContestsComponent, canActivate: [AuthGuardService, SelectedContestGuardService] },
            { path: 'sponsors', component: SpeakerComponent, canActivate: [AdminAuthGuardService, SelectedContestGuardService] },
            { path: 'categorie/new', component: CategorieComponent, canActivate: [AdminAuthGuardService, SelectedContestGuardService] },
            {
                path: 'categorie/:id',
                component: CategorieComponent,
                canActivate: [JudgeAuthGuardService, SelectedContestGuardService],
                resolve: {
                    categorie: CategorieResolve,
                },
            },
            {
                path: 'categorie/:id/scores',
                component: ScoreTableComponent,
                canActivate: [JudgeAuthGuardService, SelectedContestGuardService],
                resolve: {
                    categorie: CategorieResolve,
                    judges: JudgeResolve,
                },
            },
            {
                path: 'categorie/:id/speaker',
                component: CategorieComponent,
                canActivate: [AuthGuardService, SelectedContestGuardService],
                resolve: {
                    categorie: CategorieResolve,
                },
            },
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        GridModule,
        ExcelModule,
        UploadModule,
        AuthModule,
        AuthFormModule,
    ],
    declarations: [
        ContestsComponent,
        AdminComponent,
        CategorieComponent,
        ScoreTableComponent,
        JudgesComponent,
        SpeakerComponent,
        PortalComponent,
        PoolFormComponent,
        PlayerFormComponent,
        NewContestComponent,
    ],
    providers: [
        AdminAuthGuardService,
        JudgeAuthGuardService,
        SelectedContestGuardService,
        CategorieResolve,
        JudgeResolve,
        ContestsService,
        ExcelHelperService,
    ],
    exports: [
        RouterModule,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
})
export class ContestsModule { }
