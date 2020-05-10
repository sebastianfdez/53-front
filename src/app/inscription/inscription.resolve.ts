import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import {
    take, switchMap, map,
} from 'rxjs/operators';
import { Store } from 'store';
import { Contest } from '../shared/models/contest';
import { FirebaseService } from '../shared/services/firebase.service';

@Injectable()
export class InscriptionResolve implements Resolve<Contest> {
    constructor(
        private firebaseService: FirebaseService,
        private store: Store,
        private router: Router,
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Contest> {
        const contestId = route.queryParamMap.get('contest');
        if (!contestId) {
            return of(null);
        }
        return this.firebaseService.getContest(contestId).pipe(
            take(1),
            switchMap((contest) => {
                if (!contest || !contest.isPublic) {
                    this.router.navigate(['']);
                    return of(null);
                }
                const { contests } = this.store.value;
                const contest_ = { id: contestId, ...contest };
                contests[contestId] = contest_;
                this.store.set('contests', contests);
                return this.store.select<{[id: string]: Contest;}>('contests');
            }),
            map((contests) => contests[contestId]),
            take(1),
        );
    }
}
