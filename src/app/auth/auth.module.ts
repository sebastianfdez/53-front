import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from './auth-form/services/auth.service';
import { SharedModule } from '../shared/shared.module';

export const ROUTES: Routes = [
  {
    path: 'auth',
    children: [
        { path: '', pathMatch: 'full', redirectTo: 'login' },
        { path: 'login', loadChildren: './login/login.module#LoginModule' },
        { path: 'register', loadChildren: './register/register.module#RegisterModule' },
    ]
  }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ROUTES),
    ],
    providers: [
        AuthService,
        SharedModule
    ]
})
export class AuthModule {}
