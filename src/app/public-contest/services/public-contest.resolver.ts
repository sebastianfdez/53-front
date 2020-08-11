import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Router, Resolve,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { PublicContestsService } from './public-contest.service';
import { Contest } from '../../shared/models/contest';

@Injectable()
export class PublicContestResolver implements Resolve<Contest> {
    constructor(
        private publicContestService: PublicContestsService,
        private router: Router,
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Contest> {
        let contestId = route.params.contest;
        if (contestId === 'lyon-roller-open') {
            contestId = 'R79TaCy7lqk3XJd2FmMR';
        }
        return contestId ? this.publicContestService.getContest(contestId).pipe(
            take(1),
        ) : this.goHome();
    }

    goHome(): Observable<Contest> {
        this.router.navigate(['']);
        return of(null);
    }
}
