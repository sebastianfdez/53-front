import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from './auth-form/services/auth.service';
import { SharedModule } from '../shared/shared.module';
import { PasswordLessAuthComponent } from './password-less-auth/password-less-auth.component';

export const ROUTES: Routes = [
    {
        path: '',
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'login' },
            { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
            { path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterModule) },
            { path: 'inscription', component: PasswordLessAuthComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }

@NgModule({
    declarations: [
        PasswordLessAuthComponent
    ],
    imports: [
        AuthRoutingModule,
        CommonModule,
        SharedModule
    ],
    providers: [
        AuthService,
    ],
})
export class AuthModule {}
