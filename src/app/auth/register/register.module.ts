import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { AuthFormModule } from '../auth-form/auth-form.module';
import { SharedModule } from 'src/app/shared/shared.module';


export const ROUTES: Routes = [
  { path: '', component: RegisterComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES),
    AuthFormModule,
    SharedModule
  ],
  declarations: [
    RegisterComponent
  ],
  exports: [RouterModule],
})
export class RegisterModule {}
