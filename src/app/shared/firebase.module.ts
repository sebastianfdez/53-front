import { NgModule } from '@angular/core';
// Angular Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { firebaseKeys } from '../../firebase-keys';
import { FirebaseService } from './services/firebase.service';
import 'firebase/firestore';

@NgModule({
    imports: [
        AngularFireModule.initializeApp(firebaseKeys),
        AngularFirestoreModule, // imports firebase/firestore, only needed for database features
        AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
        AngularFireStorageModule, // imports firebase/storage only needed for storage features
        AngularFireDatabaseModule,
        AngularFireAnalyticsModule,
    ],
    providers: [
        FirebaseService,
        ScreenTrackingService,
        UserTrackingService,
    ],
})
export class FirebaseModule { }
