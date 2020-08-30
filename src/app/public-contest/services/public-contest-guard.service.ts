import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';
import { PublicContestsService } from './public-contest.service';

@Injectable()
export class PublicContestGuardService implements CanActivate {
    constructor(
        private publicContestService: PublicContestsService,
        private router: Router,
    ) {}

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
        let contestId = route.params.contest;
        if (contestId === 'lyon-roller-open') {
            contestId = 'R79TaCy7lqk3XJd2FmMR';
        }
        return contestId ? this.publicContestService.getContest(contestId).pipe(
            distinctUntilChanged(),
            switchMap((contest) => {
                if (contest && contest.isPublic) {
                    this.publicContestService.selectContest(contest);
                    return of(true);
                }
                return this.goHome();
            }),
        ) : this.goHome();
    }

    goHome(): Observable<boolean> {
        this.router.navigate(['']);
        return of(false);
    }
}
