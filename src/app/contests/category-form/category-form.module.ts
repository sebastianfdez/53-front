import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoolFormComponent } from './components/pool-form/pool-form.component';
import { PlayerFormComponent } from './components/player-form/player-form.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
    ],
    declarations: [
        PoolFormComponent,
        PlayerFormComponent,
    ],
    exports: [
        PoolFormComponent,
        PlayerFormComponent,
    ],
})
export class CategoryFormModule {}
