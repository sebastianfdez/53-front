/* eslint-disable max-classes-per-file */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from './auth-form/services/auth.service';
import { SharedModule } from '../shared/shared.module';
import { PasswordLessAuthComponent } from './password-less-auth/password-less-auth.component';
import { AuthGuardService } from './auth-form/services/auth-guard.service';

export const ROUTES: Routes = [
    {
        path: '',
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'login' },
            { path: 'login', loadChildren: () => import('./login/login.module').then((m) => m.LoginModule) },
            {
                path: 'register',
                loadChildren: () => import('./register/register.module').then((m) => m.RegisterModule),
            },
            {
                path: 'user-settings',
                loadChildren: () => import('./user-settings/user-settings.module')
                    .then((m) => m.UserSettingsModule),
            },
            { path: 'inscription', component: PasswordLessAuthComponent },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
})
export class AuthRoutingModule {}

@NgModule({
    providers: [
        AuthService,
        AuthGuardService,
    ],
})
export class AuthServiceModule {}

@NgModule({
    declarations: [
        PasswordLessAuthComponent,
    ],
    imports: [
        AuthRoutingModule,
        CommonModule,
        SharedModule,
    ],
})
export class AuthModule {}
