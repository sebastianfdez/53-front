import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from './auth-form/services/auth.service';
import { SharedModule } from '../shared/shared.module';
import { PasswordLessAuthComponent } from './password-less-auth/password-less-auth.component';

export const ROUTES: Routes = [
    {
        path: 'auth',
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'login' },
            { path: 'login', loadChildren: './login/login.module#LoginModule' },
            { path: 'register', loadChildren: './register/register.module#RegisterModule' },
            { path: 'inscription', component: PasswordLessAuthComponent }
        ]
    }
];

@NgModule({
    declarations: [
        PasswordLessAuthComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(ROUTES),
        SharedModule
    ],
    providers: [
        AuthService,
    ]
})
export class AuthModule {}
