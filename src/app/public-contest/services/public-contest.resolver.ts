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
        const contestId = route.params.contest;
        console.log(contestId);
        return contestId ? this.publicContestService.getContest(contestId).pipe(
            take(1),
        ) : this.goHome();
    }

    goHome(): Observable<Contest> {
        this.router.navigate(['']);
        return of(null);
    }
}
