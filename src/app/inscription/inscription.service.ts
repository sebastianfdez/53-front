import { Injectable } from '@angular/core';
import {
    Observable, combineLatest, of, from,
} from 'rxjs';
import { Store } from 'store';
import { switchMap, catchError, take } from 'rxjs/operators';
import { FirebaseService } from '../shared/services/firebase.service';
import { Contest } from '../shared/models/contest';
import { Categorie, Participant } from '../contests/models/categorie';
import { User } from '../shared/models/user';

@Injectable()
export class InscriptionService {
    constructor(
        private firebaseService: FirebaseService,
        private store: Store,
    ) {}

    /**
     * Get all the categorie values from a contest
     * @param contest contest
     */
    getCategories(contest: Contest): Observable<Categorie[]> {
        return combineLatest(
            contest.categories.map((c) => this.getCategorie(c)),
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
     * Enroll a player to an existing contest
     * @param player Participant object
     * @param categorieId Id of the contest
     */
    enrollContest(player: Participant, categorieId: string): Observable<void> {
        return this.getCategorie(categorieId).pipe(
            switchMap((category: Categorie) => {
                const { pools } = category;
                pools[0].participants.push(player);
                return from(this.firebaseService.updateCategorie({ ...category, pools }));
            }),
        );
    }

    /**
     * Get connected user
     */
    getUser(): Observable<User> {
        return this.store.select<User>('user');
    }
}
