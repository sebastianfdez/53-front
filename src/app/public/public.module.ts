import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule, Routes, Router } from '@angular/router';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [HomeComponent],
  exports: [
    HomeComponent,
  ]
})
export class PublicModule { }
