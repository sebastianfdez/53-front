import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSelectModule, MatTableModule, MatSortModule, MatDialogModule
} from '@angular/material';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { UploadModule } from '@progress/kendo-angular-upload';
import { FormsModule } from '@angular/forms';
import { WarningComponent } from './warning/warning.component';
import { firebaseKeys } from 'src/firebase-keys';
import { WarningService } from './warning/warning.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

const materialModules = [
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatTableModule,
  MatSortModule,
  MatDialogModule,
];

@NgModule({
  imports: [
    ...materialModules,
    CommonModule,
    FormsModule,
    GridModule,
    ExcelModule,
    UploadModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseKeys),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    AngularFireDatabaseModule,
  ],
  declarations: [
    WarningComponent,
  ],
  entryComponents: [
    WarningComponent,
  ],
  exports : [
    FormsModule,
    GridModule,
    ExcelModule,
    WarningComponent,
    UploadModule,
    ...materialModules,
  ],
  providers: [
    WarningService,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class SharedModule { }
