import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Store } from 'store';
import { switchMap, take } from 'rxjs/operators';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Categorie } from '../models/categorie';
import { ContestsService } from '../services/contest.service';
import { User } from '../../shared/models/user';

@Injectable()
export class CategorieResolve implements Resolve<Categorie> {
    constructor(
        private firebaseService: FirebaseService,
        private contestService: ContestsService,
        private store: Store,
        private router: Router,
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Categorie> {
        const categorieId: string = route.params.id;
        const open = route.url[0].path === 'categorie-open';
        return this.store.value[`categorie${categorieId}`] ? this.store.select<Categorie>(`categorie${categorieId}`).pipe(take(1))
            : this.store.select<User>('user').pipe(
                switchMap(() => this.contestService.getSelectedContest()),
                take(1),
                switchMap((contest) => {
                    if (contest.isPublic && !open) {
                        this.router.navigate([`portal/categorie-open/${categorieId}`]);
                        return null;
                    }
                    return of(contest);
                }),
                switchMap(() => this.firebaseService.getCategorie(categorieId)),
                switchMap((categorie) => {
                    if (categorieId === 'new') {
                        return of(null);
                    }
                    if (!categorie) {
                        this.router.navigate(['portal/contests']);
                        return null;
                    }
                    this.store.set(`categorie${categorieId}`, { ...categorie, id: categorieId });
                    return this.store.select<Categorie>(`categorie${categorieId}`).pipe(take(1));
                }),
            );
    }
}
