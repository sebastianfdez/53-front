import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
// Angular Marterial
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
// Custom services
import { WarningComponent } from './warning/warning.component';
import { WarningService } from './warning/warning.service';
import { SnackBarService } from './services/snack-bar.service';
import { ComponentUtils } from './services/component-utils';
import { FirebaseModule } from './firebase.module';
import { MinimalMaterialModule } from './minimal-material.module';
import { LanguagesModule } from '../language/languages.module';

const materialModules = [
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
];

@NgModule({
    imports: [
        ...materialModules,
        CommonModule,
        HttpClientModule,
        FirebaseModule,
        MinimalMaterialModule,
        LanguagesModule,
        A11yModule,
    ],
    declarations: [
        WarningComponent,
    ],
    exports: [
        WarningComponent,
        A11yModule,
        MinimalMaterialModule,
        ...materialModules,
    ],
    providers: [
        WarningService,
        SnackBarService,
        ComponentUtils,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
})
export class SharedModule { }
