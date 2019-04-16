import { Observable, of, Subject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/database';
import { Injectable } from '@angular/core';
import { User, emptyUser } from '../models/user';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class AuthService {

    authStateUser: User = null;
    authUserSub: Subject<firebase.User> = new Subject();
    private isAuthenticatedSub: Subject<boolean> = new Subject();
    private isAdminSub: Subject<boolean> = new Subject();
    private isJudgeSub: Subject<boolean> = new Subject();
    private isSpeakerSub: Subject<boolean> = new Subject();

    constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {
        this.refreshAuth();
    }

    get authenticated(): Observable<boolean> {
        return this.authStateUser ? of(true) : this.isAuthenticatedSub;
    }

    get isAdmin(): Observable<boolean> {
        if (this.authStateUser && this.authStateUser.role !== '') {
            return of(this.authStateUser.role === 'admin');
        } else {
            return this.isAdminSub;
        }
        // return this.authStateUser ? of(this.authStateUser.role === 'admin') : this.isAdminSub;
    }

    get isJudge(): Observable<boolean> {
        return (this.authStateUser && this.authStateUser.role !== '') ?
        of(this.authStateUser.role === 'judge' || this.authStateUser.role === 'admin') : this.isJudgeSub;
    }

    refreshAuth() {
        this.authStateUser = null;
        this.afAuth.authState.pipe(
            switchMap((value) => {
                this.isAuthenticatedSub.next(true);
                this.authStateUser = JSON.parse(JSON.stringify(emptyUser));
                this.authStateUser.id = value.uid;
                return this.db.doc<User>(`users/${value.uid}`).valueChanges();
            })
        )
        .subscribe((user) => {
            this.authStateUser = {...this.authStateUser, ...user};
            if (user.role === 'admin') {
                this.isAdminSub.next(true);
                this.isJudgeSub.next(true);
                this.isSpeakerSub.next(true);
            } else if (user.role === 'judge') {
                this.isAdminSub.next(false);
                this.isJudgeSub.next(true);
                this.isSpeakerSub.next(true);
            } else if (user.role === 'speaker') {
                this.isAdminSub.next(false);
                this.isJudgeSub.next(false);
                this.isSpeakerSub.next(true);
            }
        });
    }
}
