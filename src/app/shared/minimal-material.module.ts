import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

const materialModules = [
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatMenuModule,
];

@NgModule({
    imports: [
        ...materialModules,
    ],
    exports: [
        ...materialModules,
    ],
})
export class MinimalMaterialModule { }
