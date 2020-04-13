import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { UserSettingsComponent } from './user-settings.component';


export const ROUTES: Routes = [
    { path: '', component: UserSettingsComponent },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ROUTES),
        SharedModule,
    ],
    declarations: [
        UserSettingsComponent,
    ],
    exports: [RouterModule],
})
export class UserSettingsModule {}
