import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Judge } from '../models/categorie';
import { Store } from '../../store';
import { tap, take, switchMap } from 'rxjs/operators';

@Injectable()
export class JudgeResolve implements Resolve<Judge[]> {
    constructor(
        private firebaseService: FirebaseService,
        private store: Store,
    ) {}
    resolve(route: ActivatedRouteSnapshot): Observable<Judge[]> {
        return this.store.value.judges ? this.store.select<Judge[]>('judges').pipe(take(1)) :
        this.firebaseService.getJudges().pipe(
            switchMap((judges) => {
                console.log(judges);
                this.store.set('judges', judges);
                return this.store.select<Judge[]>('judges').pipe(take(1));
            })
        );
    }
}
