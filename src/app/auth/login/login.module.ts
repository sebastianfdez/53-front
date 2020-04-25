import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { AuthFormModule } from '../auth-form/auth-form.module';


export const ROUTES: Routes = [
    { path: '', component: LoginComponent },
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
})
export class LoginModule {}
