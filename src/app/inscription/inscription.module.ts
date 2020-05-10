import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { PlayerInscriptionComponent } from './player-inscription/player-inscription.component';
import { AuthFormModule } from '../auth/auth-form/auth-form.module';
import { InscriptionResolve } from './inscription.resolve';
import { TopMenuModule } from '../public/top-menu/top-menu.module';
import { InscriptionService } from './inscription.service';
import { AuthGuardService } from '../auth/auth-form/services/auth-guard.service';

const routes: Routes = [{
    path: '',
    component: PlayerInscriptionComponent,
    canActivate: [AuthGuardService],
    resolve: {
        contest: InscriptionResolve,
    },
}];

@NgModule({
    declarations: [
        PlayerInscriptionComponent,
    ],
    imports: [
        CommonModule,
        TopMenuModule,
        SharedModule,
        AuthFormModule,
        RouterModule.forChild(routes),
    ],
    providers: [
        InscriptionResolve,
        InscriptionService,
    ],
})
export class InscriptionModule {}
