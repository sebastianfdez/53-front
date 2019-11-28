import { of, Observable, from, BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap, map, tap, filter, distinctUntilChanged } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User, emptyUser } from '../../../shared/models/user';
import { Store } from '../../../store';

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
            return this.getLoggedUserInfo(user.id);
        })).subscribe();
    private adminPassword = '';
    private adminMail = '';

    constructor(
        private afAuth: AngularFireAuth,
        private db: AngularFirestore,
        private store: Store,
    ) {}

    getLoggedUserInfo(uid: string): Observable<boolean> {
        return this.db.doc<User>(`users/${uid}`).snapshotChanges().pipe(
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
            }),
        );
    }

    getAuthenticatedUser(): Observable<User> {
        return this.store.select<User>('user');
    }

    get authenticated(): Observable<boolean> {
        return this.store.select<User>('user').pipe(
            tap(user => console.log(user)),
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
        this.adminMail = user;
        this.adminPassword = pass;
        return from(this.afAuth.auth.signInWithEmailAndPassword(user, pass));
    }

    createUser(mail: string, password: string) {
        return this.afAuth.auth.createUserWithEmailAndPassword(mail, password);
    }

    hasPassword(): boolean {
        return this.adminPassword !== '';
    }

    relog() {
        return this.afAuth.auth.signInWithEmailAndPassword(this.adminMail, this.adminPassword);
    }

    logOut() {
        return this.afAuth.auth.signOut();
    }
}
