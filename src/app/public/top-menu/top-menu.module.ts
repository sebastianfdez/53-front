import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TopMenuComponent } from './top-menu.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        RouterModule.forChild([]),
    ],
    declarations: [
        TopMenuComponent,
    ],
    exports: [
        TopMenuComponent,
        RouterModule,
    ],
})
export class TopMenuModule {}
