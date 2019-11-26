import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Categorie } from '../models/categorie';
import { Observable } from 'rxjs';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Store } from '../../store';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class CategorieResolve implements Resolve<Categorie> {
    constructor(
        private firebaseService: FirebaseService,
        private store: Store,
    ) {}
    resolve(route: ActivatedRouteSnapshot): Observable<Categorie> {
        const categorieId: string = route.params.id;
        return this.store.value[`categorie${categorieId}`] ? this.store.select<Categorie>(`categorie${categorieId}`).pipe(take(1)) :
            this.firebaseService.getCategorie(categorieId).pipe(
                switchMap((categorie) => {
                    this.store.set(`categorie${categorieId}`, categorie);
                    return this.store.select<Categorie>(`categorie${categorieId}`).pipe(take(1));
                })
            );
    }
}
