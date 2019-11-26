import { Injectable } from '@angular/core';
import { Store } from '../../store';
import { Observable } from 'rxjs';
import { Contest } from '../../shared/models/contest';
import { switchMap, take } from 'rxjs/operators';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Categorie } from '../models/categorie';

@Injectable({
    providedIn: 'root'
})
    export class ContestsService {

    constructor(
        private store: Store,
        private firebaseService: FirebaseService,
    ) { }

    getContest(idContest: string): Observable<Contest> {
        return this.store.value.contest ? this.store.select<Contest>('contest') :
        this.firebaseService.getContest(idContest).pipe(
            switchMap((contest) => {
                const contest_ = {id: contest.payload.id, ...contest.payload.data()};
                this.store.set('contest', contest_);
                return this.store.select<Contest>('contest');
            })
        );
    }

    getCategorie(categorieId: string) {
        return this.store.value[`categorie${categorieId}`] ? this.store.select<Categorie>(`categorie${categorieId}`).pipe(take(1)) :
        this.firebaseService.getCategorie(categorieId).pipe(
            switchMap((categorie) => {
                categorie.id = categorieId;
                this.store.set(`categorie${categorieId}`, categorie);
                return this.store.select<Categorie>(`categorie${categorieId}`).pipe(take(1));
            })
        );
    }

    addNewCategorie(contestId: string, categorieId: string) {
        const categories: string[] = this.store.value.contest.categories;
        categories.push(categorieId);
        this.store.set('contest', Object.assign(this.store.value.contest, { categories }));
        this.firebaseService.updateContest(contestId, { categories });
    }

    deleteCategorie(contestId: string, categorieId: string) {
        const categories: string[] = this.store.value.contest.categories.filter(cat => cat !== categorieId);
        this.store.set('contest', Object.assign(this.store.value.contest, { categories }));
        this.firebaseService.updateContest(contestId, { categories });
    }
}
