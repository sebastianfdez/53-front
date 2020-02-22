import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthFormModule } from '../auth-form/auth-form.module';
import { SharedModule } from 'src/app/shared/shared.module';


export const ROUTES: Routes = [
  { path: '', component: LoginComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    AuthFormModule,
    SharedModule,
  ],
  declarations: [
    LoginComponent
  ]
})
export class LoginModule {}
