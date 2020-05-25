import { Injectable } from '@angular/core';
import { Store } from 'store';
import { Observable, of } from 'rxjs';
import {
    switchMap, take, catchError, map, distinctUntilChanged,
} from 'rxjs/operators';
import { Contest } from '../../shared/models/contest';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Categorie, Participant, PublicVote } from '../../contests/models/categorie';

@Injectable({
    providedIn: 'root',
})
export class PublicContestsService {
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
                take(1),
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
        return this.store.value.contests[idContest] ? this.store.select<{[id: string]: Contest;}>('contests').pipe(
            map((contests) => contests[idContest]),
        ) : this.firebaseService.getContest(idContest).pipe(
            switchMap((contest) => {
                const contests = this.store.value.contests ? this.store.value.contests : {};
                const contest_ = { id: idContest, ...contest };
                contests[idContest] = contest_;
                this.store.set('contests', contests);
                return this.store.select<{[id: string]: Contest;}>('contests');
            }),
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

    /**
     * Update a player from a category
     * @param category Category to update
     * @param participant Participant to update
     */
    updatePlayer(category: Categorie, participant: Partial<Participant>) {
        const category_ = category;
        for (let j = 0; j < category_.pools.length; j++) {
            // value[1][i].pools[j].participants.forEach((participant) => {
            for (let k = 0; k < category_.pools[j].participants.length; k++) {
                if (category_.pools[j].participants[k].id === participant.id) {
                    category_.pools[j].participants[k] = {
                        ...category_.pools[j].participants[k],
                        ...participant,
                    };
                }
            }
        }
        return this.firebaseService.updateCategorie(category_);
    }

    getVote(idVote: string): Observable<PublicVote> {
        return this.firebaseService.getParticipantVotes(idVote);
    }

    vote(userIP: string, vote: PublicVote, voteid: string) {
        return this.firebaseService.vote(userIP, vote, voteid);
    }
}
