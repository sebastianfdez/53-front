import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { LoginComponent } from './login/login.component';
import { AuthFormModule } from '../auth-form/auth-form.module';
import { ConnectedGuardService } from '../auth-form/services/connected-guard.service';


export const ROUTES: Routes = [
    {
        path: '',
        component: LoginComponent,
        canActivate: [
            ConnectedGuardService,
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ROUTES),
        AuthFormModule,
        SharedModule,
    ],
    declarations: [
        LoginComponent,
    ],
    providers: [
        ConnectedGuardService,
    ],
})
export class LoginModule {}
