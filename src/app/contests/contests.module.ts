import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

// Components
import { ContestsComponent } from './components/contests/contests.component';
import { AdminComponent } from './components/admin/admin.component';
import { CategorieComponent } from './components/categorie/categorie.component';
import { ScoreTableComponent } from './components/score-table/score-table.component';
import { JudgesComponent } from './components/judges/judges.component';
import { SpeakerComponent } from './components/speaker/speaker.component';
import { PortalComponent } from './components/portal/portal.component';

// Services
import { AuthGuardService } from './services/auth-guard.service';
import { JudgeAuthGuardService, AdminAuthGuardService } from './services/admin-guard.service';
import { CategorieResolve } from './resolvers/categorie.resolve';
import { JudgeResolve } from './resolvers/judge.resolve';
import { CommonModule } from '@angular/common';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { UploadModule } from '@progress/kendo-angular-upload';
import { AuthModule } from '../auth/auth.module';
import { ContestsService } from './services/contest.service';
import { SelectedContestGuardService } from './services/selected-contest-guard.service';


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
        }
      },
      { path: 'speaker', component: ContestsComponent, canActivate: [AuthGuardService, SelectedContestGuardService] },
      { path: 'sponsors', component: SpeakerComponent, canActivate: [AdminAuthGuardService, SelectedContestGuardService] },
      { path: 'categorie/new', component: CategorieComponent, canActivate: [AdminAuthGuardService, SelectedContestGuardService] },
      { 
        path: 'categorie/:id',
        component: CategorieComponent,
        canActivate: [JudgeAuthGuardService, SelectedContestGuardService],
        resolve: {
          categorie: CategorieResolve,
        }
      },
      { 
        path: 'categorie/:id/scores', component: ScoreTableComponent,
        canActivate: [JudgeAuthGuardService, SelectedContestGuardService],
        resolve: {
          categorie: CategorieResolve,
          judges: JudgeResolve,
        }
      },
      { path: 'categorie/:id/speaker', component: CategorieComponent, canActivate: [AuthGuardService, SelectedContestGuardService], resolve: {
        categorie: CategorieResolve,
      } },
    ]
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
  ],
  declarations: [
    ContestsComponent,
    AdminComponent,
    CategorieComponent,
    ScoreTableComponent,
    JudgesComponent,
    SpeakerComponent,
    PortalComponent,
  ],
  providers: [
    AuthGuardService,
    AdminAuthGuardService,
    JudgeAuthGuardService,
    SelectedContestGuardService,
    CategorieResolve,
    JudgeResolve,
    ContestsService,
  ],
  exports: [
    RouterModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class ContestsModule { }
