import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSelectModule, MatTableModule, MatSortModule, MatDialogModule
} from '@angular/material';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { UploadModule } from '@progress/kendo-angular-upload';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WarningComponent } from './warning/warning.component';
import { firebaseKeys } from 'src/firbase-keys';
import { WarningService } from './warning/warning.service';
import { HttpClientModule } from '@angular/common/http';

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
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    GridModule,
    ExcelModule,
    UploadModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseKeys),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    AngularFireDatabaseModule,
    ...materialModules,
  ],
  declarations: [
    WarningComponent,
  ],
  entryComponents: [
    WarningComponent,
  ],
  exports : [
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    GridModule,
    ExcelModule,
    WarningComponent,
    UploadModule,
    ...materialModules,
  ],
  providers: [
    WarningService,
  ]
})
export class SharedModule { }
