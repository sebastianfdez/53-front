import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthFormComponent } from './auth-form.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
  ],
  declarations: [
    AuthFormComponent
  ],
  exports: [
    AuthFormComponent,
    SharedModule,
  ]
})
export class AuthFormModule {}
