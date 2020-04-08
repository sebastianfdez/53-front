import { Injectable } from '@angular/core';
import { AngularFirestore, Action, DocumentSnapshot } from '@angular/fire/firestore';
import {
    Observable, of, combineLatest, from,
} from 'rxjs';
import {
    take, switchMap,
} from 'rxjs/operators';
import { Store } from 'store';
import { Categorie, Judge } from '../../contests/models/categorie';
import { Contest } from '../models/contest';
import { User } from '../models/user';
import { Speaker } from '../../contests/models/speaker';

@Injectable({
    providedIn: 'root',
})
export class FirebaseService {
    constructor(
        private database: AngularFirestore,
        private store: Store,
    ) { }

    getCategorie(id: string): Observable<Categorie> {
        const snapshot: Observable<Categorie> = this.database.doc<Categorie>(`categories/${id}`).valueChanges().pipe(take(1));
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
            switchMap((contest) => (contest && contest.judges.length ? combineLatest(
                contest.judges.map((judge) => this.database.collection('users').doc<Judge>(judge).snapshotChanges().pipe(take(1))),
            ) : of([]))),
            switchMap((judges) => of(
                judges.map((judge) => ({ ...judge.payload.data(), id: judge.payload.id })),
            )),
        );
    }

    getSpeaker(idSpeaker: string): Observable<Action<DocumentSnapshot<Speaker>>> {
        return this.database.collection('users').doc<Speaker>(idSpeaker).snapshotChanges().pipe(take(1));
    }

    getContest(idContest: string): Observable<Contest> {
        return this.database.collection<Contest>('contests').doc<Contest>(idContest).valueChanges();
    }

    createJudge(userId: string, judge: Judge): Observable<any> {
        return this.database.collection('users').doc<Judge>(userId).valueChanges().pipe(
            switchMap((judge_) => {
                if (!judge_) {
                    return this.database.collection<Judge>('users').doc<Judge>(userId).set(judge);
                }
                return of(judge_);
            }),
        );
    }

    deleteJudge(judgeid: string): Promise<void> {
        return this.database.collection('users').doc(judgeid).delete();
    }

    updateJudge(judge: Judge) {
        this.database.collection('users').doc<Judge>(judge.id).update({ name: judge.name, lastName: judge.lastName });
    }

    updateContest(contestId: string, contest: Partial<Contest>) {
        return from(
            this.database.collection('contests').doc<Contest>(contestId).update(contest)
                .catch((err) => console.log(err)),
        );
    }

    createContest(contest: Contest) {
        return this.database.collection<Contest>('contests').add(contest);
    }

    createUser(user: User) {
        return from(this.database.collection<User>('users').doc<User>(user.id).set(user));
    }
}
