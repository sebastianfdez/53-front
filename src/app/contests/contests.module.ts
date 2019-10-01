import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

// Components
import { LoginComponent } from './components/login/login.component';
import { ContestsComponent } from './components/contests/contests.component';
import { AdminComponent } from './components/admin/admin.component';
import { CategorieComponent } from './components/categorie/categorie.component';
import { ScoreTableComponent } from './components/score-table/score-table.component';
import { JudgesComponent } from './components/judges/judges.component';
import { SpeakerComponent } from './components/speaker/speaker.component';

// Services
import { AuthGuardService } from './services/auth-guard.service';
import { JudgeAuthGuardService, AdminAuthGuardService } from './services/admin-guard.service';
import { AuthService } from './services/auth.service';
import { FirebaseService } from './services/firebase.service';
import { CategorieResolve } from './resolvers/cateogrie.resolve';
import { JudgeResolve } from './resolvers/judge.resolve';
import { CommonModule } from '@angular/common';


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'contests', component: ContestsComponent, canActivate: [JudgeAuthGuardService] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuardService] },
  { path: 'judges', component: JudgesComponent, canActivate: [AdminAuthGuardService], resolve: {
    judges: JudgeResolve,
  }},
  { path: 'speaker', component: ContestsComponent, canActivate: [AuthGuardService] },
  { path: 'sponsors', component: SpeakerComponent, canActivate: [AdminAuthGuardService] },
  { path: 'categorie/new', component: CategorieComponent, canActivate: [AdminAuthGuardService] },
  { path: 'categorie/:id', component: CategorieComponent, canActivate: [JudgeAuthGuardService], resolve: {
    categorie: CategorieResolve,
  }},
  { path: 'categorie/:id/scores', component: ScoreTableComponent, canActivate: [JudgeAuthGuardService], resolve: {
    categorie: CategorieResolve,
    judges: JudgeResolve,
  }},
  { path: 'categorie/:id/speaker', component: CategorieComponent, canActivate: [AuthGuardService] },
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    LoginComponent,
    ContestsComponent,
    AdminComponent,
    CategorieComponent,
    ScoreTableComponent,
    JudgesComponent,
    SpeakerComponent,
  ],
  providers: [
    AuthService,
    AuthGuardService,
    AdminAuthGuardService,
    JudgeAuthGuardService,
    CategorieResolve,
    JudgeResolve,
    FirebaseService,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class ContestsModule { }
