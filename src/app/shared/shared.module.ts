import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatTableModule, MatSortModule,
  MatDialogModule, MatSnackBarModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
} from '@angular/material';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WarningComponent } from './warning/warning.component';
import { firebaseKeys } from 'src/firebase-keys';
import { WarningService } from './warning/warning.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SnackBarService } from './services/snack-bar.service';
import { ComponentUtils } from './services/component-utils';
import { FirebaseService } from './services/firebase.service';
import { A11yModule } from '@angular/cdk/a11y';

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
  entryComponents: [
    WarningComponent,
  ],
  exports : [
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
