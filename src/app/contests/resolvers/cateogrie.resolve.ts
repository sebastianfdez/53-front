import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Categorie } from '../models/categorie';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';

@Injectable()
export class CategorieResolve implements Resolve<Categorie> {
    constructor(
        private firebaseService: FirebaseService,
    ) {}
    resolve(route: ActivatedRouteSnapshot): Observable<Categorie> {
        return this.firebaseService.getCategorie(route.params.id);
    }
}
