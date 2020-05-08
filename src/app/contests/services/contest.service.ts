import { Injectable } from '@angular/core';
import { Store } from 'store';
import { Observable, of } from 'rxjs';
import {
    switchMap, take, catchError, map, distinctUntilChanged, tap,
} from 'rxjs/operators';
import { User } from 'src/app/shared/models/user';
import { Contest } from '../../shared/models/contest';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Categorie } from '../models/categorie';

@Injectable({
    providedIn: 'root',
})
export class ContestsService {
    constructor(
        private store: Store,
        private firebaseService: FirebaseService,
    ) {}

    selectContest(contest: Contest): void {
        this.store.set('selectedContest', contest);
    }

    /**
     * Return the contest selected by the user.
     * @return {Observable<Contest>} Observable of the active contest
    */
    getSelectedContest(): Observable<Contest> {
    // Search first in the store
    // if it's empty, search the selected contest id in the local storage
        return this.store.value.selectedContest ? this.store.select<Contest>('selectedContest')
        // eslint-disable-next-line no-undef
            : this.getContest(window.localStorage.getItem('selectedContest')).pipe(
                switchMap((contest) => {
                    this.selectContest(contest);
                    return this.store.select<Contest>('selectedContest');
                }),
                distinctUntilChanged(),
            );
    }

    /**
     * Return a contest from a provided id
     * @param  {string} idContest       Id of the contest
     * @return {Observable<Contest>}    Return observable of the contest
    */
    getContest(idContest: string): Observable<Contest> {
        let contest$: Observable<{[id: string]: Contest;}> = null;
        contest$ = this.store.value.contests[idContest] ? this.store.select<{[id: string]: Contest;}>('contests')
            : this.firebaseService.getContest(idContest).pipe(
                switchMap((contest) => {
                    const { contests } = this.store.value;
                    const contest_ = { id: idContest, ...contest };
                    contests[idContest] = contest_;
                    this.store.set('contests', contests);
                    return this.store.select<{[id: string]: Contest;}>('contests');
                }),
            );
        return contest$.pipe(
            map((contests) => contests[idContest]),
        );
    }

    /**
     * Return a category from a provided id
     * @param  {string} categorieId       Id of the contest
     * @return {Observable<Categorie>}    Return observable of the contest
    */
    getCategorie(categorieId: string): Observable<Categorie> {
        return this.store.value[`categorie${categorieId}`] ? this.store.select<Categorie>(`categorie${categorieId}`).pipe(take(1))
            : this.firebaseService.getCategorie(categorieId).pipe(
                catchError((error) => {
                    console.log(error);
                    return of(null);
                }),
                switchMap((categorie: Categorie) => {
                    if (categorie) {
                        this.store.set(`categorie${categorieId}`, { ...categorie, id: categorieId });
                        return this.store.select<Categorie>(`categorie${categorieId}`).pipe(take(1));
                    }
                    return of(null);
                }),
            );
    }

    addNewCategorie(contestId: string, categorieId: string): void {
        const { categories } = this.store.value.selectedContest;
        categories.push(categorieId);
        this.store.set('contest', Object.assign(this.store.value.selectedContest, { categories }));
        this.firebaseService.updateContest(contestId, { categories }).pipe(
            catchError((error) => {
                console.log(error);
                return null;
            }),
        );
    }

    deleteCategorie(contestId: string, categorieId: string): void {
        this.firebaseService.deleteCategorie(categorieId);
        const categories: string[] = this.store.value.selectedContest.categories
            .filter((cat) => cat !== categorieId);
        this.store.set('contest', Object.assign(this.store.value.selectedContest, { categories }));
        this.firebaseService.updateContest(contestId, { categories });
    }

    getSpeaker(): Observable<User> {
        if (this.store.value.speaker) {
            return this.store.select<User>('speaker').pipe(take(1));
        }
        return this.store.select<Contest>('selectedContest').pipe(
            switchMap((contest) => this.firebaseService.getUser(contest.speaker)),
            switchMap((user) => {
                const speaker: User = user;
                this.store.set('speaker', speaker);
                return this.store.select<User>('speaker');
            }),
        );
    }

    newContest(contest: Contest): Observable<User> {
        return this.firebaseService
            .newContestForUser({
                ...contest,
                admins: [this.store.value.user.mail],
            }, this.store.value.user)
            .pipe(
                tap((user) => this.store.set('user', user)),
            );
    }
}
