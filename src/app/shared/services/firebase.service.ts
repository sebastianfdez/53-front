import { Injectable } from '@angular/core';
import {
    AngularFirestore, Action, DocumentSnapshot, QueryFn,
} from '@angular/fire/firestore';
import {
    Observable, of, combineLatest, from,
} from 'rxjs';
import {
    take, switchMap, map, tap,
} from 'rxjs/operators';
import { Categorie } from '../../contests/models/categorie';
import { Contest } from '../models/contest';
import { User } from '../models/user';

@Injectable({
    providedIn: 'root',
})
export class FirebaseService {
    constructor(
        private database: AngularFirestore,
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

    /**
     * Get Judges from a provided contest
     * @param contest Contest
     * @return Observable of judges
     */
    getJudges(contest: Contest): Observable<User[]> {
        if (!contest.judges || !contest.judges.length) {
            return of([]);
        }
        return combineLatest(
            contest.judges.map((judge) => this.database.collection('users').doc<User>(judge).snapshotChanges()),
        ).pipe(
            take(1),
            switchMap((judges) => of(
                judges.map((judge) => ({ ...judge.payload.data(), id: judge.payload.id })),
            )),
        );
    }

    getSpeaker(idSpeaker: string): Observable<Action<DocumentSnapshot<User>>> {
        return this.database.collection('users').doc<User>(idSpeaker).snapshotChanges().pipe(take(1));
    }

    getContest(idContest: string): Observable<Contest> {
        return this.database.collection<Contest>('contests').doc<Contest>(idContest).valueChanges();
    }

    createJudge(judge: User, contest: string): Observable<User> {
        const query: QueryFn = (collection) => collection.where('mail', '==', judge.mail);
        return this.database.collection<User>('users', query).valueChanges().pipe(
            take(1),
            switchMap((judge_) => {
                console.log(judge_);
                if (!judge_) {
                    return this.createNewJudge(judge.id, judge);
                }
                const newJudge: User = judge_[0];
                newJudge.contest.push(contest);
                newJudge.role[contest] = judge.role[contest];
                return this.updateUser(newJudge.id, newJudge);
            }),
        );
    }

    createNewJudge(userId: string, judge: User): Observable<User> {
        return from(this.database.collection<User>('users').doc<User>(userId).set(judge)).pipe(
            map(() => judge),
        );
    }

    /**
     * Delete an old judge user with mail id
     * @param judgeid user id
     */
    deleteJudge(judgeid: string): Promise<void> {
        return this.database.collection('users').doc(judgeid).delete();
    }

    /**
     * Update a user
     * @param userId id of the user
     * @param user new value of the user
     */
    updateUser(userId: string, user: User) {
        console.log({ userId, user });
        return from(
            this.database.collection('users').doc<User>(userId).update(user).catch(
                (error) => console.log(error),
            ),
        ).pipe(
            tap((user_) => console.log(user_)),
            map(() => user),
        );
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
