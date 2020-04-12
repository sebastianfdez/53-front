import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { RegisterComponent } from './register/register.component';
import { AuthFormModule } from '../auth-form/auth-form.module';


export const ROUTES: Routes = [
    { path: '', component: RegisterComponent },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ROUTES),
        AuthFormModule,
        SharedModule,
    ],
    declarations: [
        RegisterComponent,
    ],
    exports: [RouterModule],
})
export class RegisterModule {}
