import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
// Angular Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import 'firebase/firestore';
// Custom services
import { firebaseKeys } from 'src/firebase-keys';
import { WarningComponent } from './warning/warning.component';
import { WarningService } from './warning/warning.service';
import { SnackBarService } from './services/snack-bar.service';
import { ComponentUtils } from './services/component-utils';
import { FirebaseService } from './services/firebase.service';

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
];

@NgModule({
    imports: [
        ...materialModules,
        CommonModule,
        FormsModule,
        HttpClientModule,
        AngularFireModule.initializeApp(firebaseKeys),
        AngularFirestoreModule, // imports firebase/firestore, only needed for database features
        AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
        AngularFireStorageModule, // imports firebase/storage only needed for storage features
        AngularFireDatabaseModule,
        ReactiveFormsModule,
        A11yModule,
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
        FirebaseService,
        MatDatepickerModule,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
})
export class SharedModule { }
