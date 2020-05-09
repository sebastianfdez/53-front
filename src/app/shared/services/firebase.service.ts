import { Injectable } from '@angular/core';
import {
    AngularFirestore, QueryFn, DocumentReference,
} from '@angular/fire/firestore';
import {
    Observable, of, combineLatest, from,
} from 'rxjs';
import {
    take, switchMap, map, catchError, tap,
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

    /**
     * Return a user from a provided id
     * @param id user id
     */
    getUser(id: string): Observable<User> {
        return this.database.collection('users').doc<User>(id).snapshotChanges().pipe(
            take(1),
            map((doc) => doc.payload.data()),
        );
    }

    /**
     * Get user list from a mail
     * @param mail mail
     */
    getUserByMail(mail: string): Observable<User[]> {
        const query: QueryFn = (collection) => collection.where('mail', '==', mail);
        return this.database.collection<User>('users', query).valueChanges();
    }

    getContest(idContest: string): Observable<Contest> {
        return this.database.collection<Contest>('contests').doc<Contest>(idContest).valueChanges();
    }

    createJudge(judge: User, contest: string): Observable<User> {
        return this.getUserByMail(judge.mail).pipe(
            take(1),
            switchMap((judge_) => {
                if (!judge_ || !judge_.length) {
                    return this.createNewJudge(judge, judge.mail);
                }
                const newJudge: User = judge_[0];
                if (!newJudge.contest.includes(contest)) {
                    newJudge.contest.push(contest);
                }
                newJudge.autenticated = true;
                newJudge.role[contest] = judge.role[contest];
                return this.updateUser(newJudge.id, newJudge);
            }),
        );
    }

    /**
     * Create a new User instance in the collection and return it
     * @param judge judge
     */
    createNewJudge(judge: User, id: string): Observable<User> {
        return from(this.database.collection<User>('users').doc(id).set(judge)).pipe(
            map((doc) => doc),
            switchMap(() => this.getUser(id)),
        );
    }

    /**
     * @deprecated
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
    updateUser(userId: string, user: Partial<User>): Observable<User> {
        return from(
            this.database.collection('users').doc<User>(userId).update(user),
        ).pipe(
            catchError((error) => {
                console.log(error);
                return of(null);
            }),
            map(() => user as User),
        );
    }

    updateContest(contestId: string, contest: Partial<Contest>) {
        return from(
            this.database.collection('contests').doc<Contest>(contestId).update(contest)
                .catch((err) => console.log(err)),
        );
    }

    createContest(contest: Contest): Promise<DocumentReference> {
        return this.database.collection<Contest>('contests').add(contest);
    }

    createUser(user: User) {
        return from(this.database.collection<User>('users').doc<User>(user.id).set(user));
    }

    newContestForUser(contest: Contest, user: User): Observable<User> {
        return from(this.createContest(contest)).pipe(
            switchMap((newContest) => {
                user.contest.push(newContest.id);
                const role = { ...user.role };
                role[newContest.id] = 'admin';
                return combineLatest(this.updateUser(user.id, { ...user, role }), of(newContest));
            }),
            switchMap(([user_, contest_]) => combineLatest(
                of(user_), this.updateContest(contest_.id, { id: contest_.id }),
            )),
            switchMap(([user_]) => of(user_)),
        );
    }
}
