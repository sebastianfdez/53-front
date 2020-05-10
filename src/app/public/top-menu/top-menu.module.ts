import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TopMenuComponent } from './top-menu.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
    ],
    declarations: [
        TopMenuComponent,
    ],
    exports: [
        TopMenuComponent,
    ],
})
export class TopMenuModule {}
