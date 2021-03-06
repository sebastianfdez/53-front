import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
// Angular Marterial
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
// Custom services
import { WarningComponent } from './warning/warning.component';
import { WarningService } from './warning/warning.service';
import { SnackBarService } from './services/snack-bar.service';
import { ComponentUtils } from './services/component-utils';
import { FirebaseModule } from './firebase.module';
import { ApiService } from './services/api.service';

const materialModules = [
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatFormFieldModule,
];

@NgModule({
    imports: [
        ...materialModules,
        CommonModule,
        FormsModule,
        HttpClientModule,
        FirebaseModule,
        ReactiveFormsModule,
        A11yModule,
        HttpClientJsonpModule,
    ],
    declarations: [
        WarningComponent,
    ],
    exports: [
        FormsModule,
        WarningComponent,
        ReactiveFormsModule,
        A11yModule,
        ...materialModules,
    ],
    providers: [
        WarningService,
        SnackBarService,
        ComponentUtils,
        MatDatepickerModule,
        ApiService,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
})
export class SharedModule { }
