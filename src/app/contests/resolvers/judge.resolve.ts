import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { Judge } from '../models/categorie';

@Injectable()
export class JudgeResolve implements Resolve<Judge[]> {
    constructor(
        private firebaseService: FirebaseService,
    ) {}
    resolve(route: ActivatedRouteSnapshot): Observable<Judge[]> {
        return this.firebaseService.getJudges();
    }
}
