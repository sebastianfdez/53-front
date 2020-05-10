/* eslint-disable no-undef */
import {
    of, Observable, from, BehaviorSubject,
} from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import {
    switchMap, map, filter, tap, distinctUntilChanged,
} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store } from 'store';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { User, emptyUser } from '../../../shared/models/user';
import { FirebaseService } from '../../../shared/services/firebase.service';

@Injectable()
export class AuthService {
    authState$: BehaviorSubject<firebase.User> = new BehaviorSubject<firebase.User>(undefined);

    constructor(
        private afAuth: AngularFireAuth,
        private firebaseService: FirebaseService,
        private store: Store,
        private analytics: AngularFireAnalytics,
    ) {
        this.getAuth();
    }

    getAuth() {
        this.afAuth.authState.pipe(
            distinctUntilChanged(),
            tap((user) => this.authState$.next(user)),
            switchMap((user_) => {
                if (!user_) {
                    this.store.set('user', null);
                    return of(false);
                }
                this.analytics.setUserId(user_.uid);
                const user: User = JSON.parse(JSON.stringify(emptyUser));
                user.id = user_.uid;
                user.mail = user_.email;
                return this.getLoggedUserInfo(user_.uid, user_.email);
            }),
        ).subscribe();
    }

    getLoggedUserInfo(uid: string, mail: string): Observable<boolean> {
        return this.firebaseService.getUser(uid).pipe(
            switchMap((user_) => {
                if (user_) {
                    return of([user_]);
                }
                return this.firebaseService.getUserByMail(mail);
            }),
            switchMap((user_) => {
                if (user_ && user_.length) {
                    this.store.set('user', {
                        ...this.store.value.user,
                        autenticated: true,
                        role: user_[0].role,
                        id: user_[0].id,
                        mail: user_[0].mail,
                        name: user_[0].name,
                        lastName: user_[0].lastName,
                        contest: user_[0].contest,
                    });
                    return of(true);
                }
                return of(false);
            }),
        );
    }

    getAuthenticatedUser(reload?: boolean): Observable<User> {
        if (reload) {
            return this.getLoggedUserInfo(this.store.value.user.id, this.store.value.user.mail)
                .pipe(
                    switchMap(() => this.store.select<User>('user')),
                );
        }
        return this.store.select<User>('user');
    }

    get authenticated(): Observable<boolean> {
        return this.store.value.user !== undefined ? this.store.select<User>('user').pipe(
            map((user) => {
                return (user ? user.autenticated : false);
            }),
        ) : this.authState$.pipe(
            filter((user) => user !== undefined),
            map((user) => {
                return !!user;
            }),
        );
    }

    isAdmin(): Observable<boolean> {
        return this.store.select<User>('user').pipe(
            filter((user) => user !== null && user !== undefined),
            switchMap((user) => of(user.role[
                this.store.value.selectedContest
                    ? this.store.value.selectedContest.id
                    : window.localStorage.getItem('selectedContest')].indexOf('admin') >= 0)),
        );
    }

    isJudge(): Observable<boolean> {
        return this.store.select<User>('user').pipe(
            filter((user) => user !== null && user !== undefined),
            switchMap((user) => of(
                user.role[
                    this.store.value.selectedContest
                        ? this.store.value.selectedContest.id
                        : window.localStorage.getItem('selectedContest')] === 'judge'
                    || user.role[
                        this.store.value.selectedContest
                            ? this.store.value.selectedContest.id
                            : window.localStorage.getItem('selectedContest')] === 'admin'
                    || user.role[
                        this.store.value.selectedContest
                            ? this.store.value.selectedContest.id
                            : window.localStorage.getItem('selectedContest')] === 'adminjudge',
            )),
        );
    }

    signIn(user: string, pass: string): Observable<firebase.auth.UserCredential> {
        return from(this.afAuth.signInWithEmailAndPassword(user, pass));
    }

    createUser(mail: string, password: string): Promise<firebase.auth.UserCredential> {
        return this.afAuth.createUserWithEmailAndPassword(mail, password);
    }

    logOut() {
        return this.afAuth.signOut();
    }

    // Sign in with email link
    confirmSignIn(url: string): boolean {
        if (this.afAuth.isSignInWithEmailLink(url)) {
            return true;
        }
        return false;
    }

    sendLogInLink(mail: string) {
        const actionCodeSettings: firebase.auth.ActionCodeSettings = {
            url: 'https://www.la53.fr/auth/inscription',
            handleCodeInApp: true,
        };
        return this.afAuth.sendSignInLinkToEmail(mail, actionCodeSettings);
    }

    signInWithLink(mail: string, url: string) {
        return this.afAuth.signInWithEmailLink(mail, url);
    }

    /**
     * Send reset password link to provided mail
     * @param mail user mail
     */
    changePassword(mail: string) {
        return from(this.afAuth.sendPasswordResetEmail(mail));
    }
}
