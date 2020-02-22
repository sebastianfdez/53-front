import { of, Observable, from, BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap, map, tap, filter, distinctUntilChanged } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User, emptyUser } from '../../../shared/models/user';
import { Store } from '../../../store';
import { AngularFireModule } from '@angular/fire';
import { firebaseKeys } from '../../../../firebase-keys';

@Injectable()
export class AuthService {

    auth$ = this.afAuth.authState.pipe(
        switchMap((user_) => {
            if (!user_) {
                this.store.set('user', null);
                return of(null);
            }
            const user: User = JSON.parse(JSON.stringify(emptyUser));
            user.id = user_.uid;
            user.mail = user_.email;
            user.id = user_.uid;
            user.role = 'admin';
            return this.getLoggedUserInfo(user.id, user.mail);
        })).subscribe();

    constructor(
        private afAuth: AngularFireAuth,
        private db: AngularFirestore,
        private store: Store,
    ) {}

    getLoggedUserInfo(uid: string, mail: string): Observable<boolean> {
        return this.db.doc<User>(`users/${uid}`).snapshotChanges().pipe(
            switchMap((user_) => {
                if (user_ && user_.payload.data()) {
                    return of(user_);
                } else {
                    return this.db.doc<User>(`users/${mail}`).snapshotChanges();
                }
            }),
            switchMap((user_) => {
                if (user_) {
                    this.store.set('user', {
                        ...this.store.value.user,
                        autenticated: true,
                        role: user_.payload.data().role,
                        id: user_.payload.id,
                        name: user_.payload.data().name,
                        lastName: user_.payload.data().lastName,
                        contest: user_.payload.data().contest,
                    });
                    return of(true);
                } else {
                    return of(false);
                }
            })
        );
    }

    getAuthenticatedUser(): Observable<User> {
        return this.store.select<User>('user');
    }

    get authenticated(): Observable<boolean> {
        return this.store.select<User>('user').pipe(
            filter(user => user !== null && user !== undefined),
            map((user) => user ? user.autenticated : false)
        );
    }

    isAdmin(): Observable<boolean> {
        return this.store.select<User>('user').pipe(
            filter(user => user !== null && user !== undefined),
            switchMap((user) => {
                return of(user.role === 'admin');
            })
        );
    }

    isJudge(): Observable<boolean> {
        return this.store.select<User>('user').pipe(
            filter(user => user !== null && user !== undefined),
            switchMap((user) => {
                return of(user.role === 'judge' || user.role === 'admin');
            })
        );
    }

    signIn(user: string, pass: string): Observable<firebase.auth.UserCredential> {
        return from(this.afAuth.auth.signInWithEmailAndPassword(user, pass));
    }

    createUser(mail: string, password: string) {
        return this.afAuth.auth.createUserWithEmailAndPassword(mail, password);
    }

    logOut() {
        return this.afAuth.auth.signOut();
    }

    // Sign in with email link
    confirmSignIn(url: string): boolean {
        if (this.afAuth.auth.isSignInWithEmailLink(url)) {
            return true;
        }
        return false;
    }

    sendLogInLink(mail: string) {
        const actionCodeSettings: firebase.auth.ActionCodeSettings = {
            url: `https://www.la53.fr/auth/inscription`,
            handleCodeInApp: true,
        };
        return this.afAuth.auth.sendSignInLinkToEmail(mail, actionCodeSettings);
    }

    signInWithLink(mail: string, url: string) {
        return this.afAuth.auth.signInWithEmailLink(mail, url);
    }
}
