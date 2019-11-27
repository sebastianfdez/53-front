import { Injectable } from '@angular/core';
import { AngularFirestore, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, of, combineLatest, from } from 'rxjs';
import { Categorie, Judge } from '../../contests/models/categorie';
import { take, switchMap, map } from 'rxjs/operators';
import { Contest } from '../models/contest';
import { Store } from '../../store';
import { User } from '../models/user';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {

    constructor(
        private database: AngularFirestore,
        private store: Store,
    ) { }

    getCategorie(id: string): Observable<Categorie> {
        const snapshot: Observable<Categorie> =
            this.database.doc<Categorie>(`categories/${id}`).valueChanges().pipe(take(1));
        return snapshot;
    }

    deleteCategorie(id: string) {
        this.database.collection('categories').doc(id).delete();
    }

    updateCategorie(categorie: Categorie) {
        return this.database.collection('categories').doc<Categorie>(categorie.id).update(categorie);
    }

    addCategorie(categorie: Categorie) {
        return this.database.collection<Categorie>('categories').add(categorie);
    }

    getJudges(): Observable<Judge[]> {
        return this.store.select<Contest>('contest').pipe(
            take(1),
            switchMap((contest) => {
                return contest && contest.judges.length ? combineLatest(
                     contest.judges.map((judge) => {
                        return this.database.collection('users').doc<Judge>(judge).snapshotChanges().pipe(take(1));
                    })
                ) : of([]);
            }),
            switchMap((judges) => {
                return of(judges.map(judge => {
                    return {...judge.payload.data(), id: judge.payload.id};
                }));
            }),
        );
    }

    getContest(idContest: string): Observable<Contest> {
        return this.database.collection<Contest>('contests').doc<Contest>(idContest).valueChanges();
    }

    createJudge(userId: string, judge: Judge) {
        return from(this.database.collection<Judge>('users').doc<Judge>(userId).set(judge));
    }

    deleteJudge(judgeid: string) {
        this.database.collection('users').doc(judgeid).delete();
    }

    updateJudge(judge: Judge) {
        this.database.collection('users').doc<Judge>(judge.id).update({name: judge.name, lastName: judge.lastName});
    }

    updateContest(contestId: string, contest: Partial<Contest>) {
        return from(this.database.collection('contests').doc<Contest>(contestId).update(contest));
    }

    createContest(contest: Contest) {
        return this.database.collection<Contest>('contests').add(contest);
    }

    createUser(user: User) {
        return from(this.database.collection<User>('users').doc<User>(user.id).set(user));
    }
}
