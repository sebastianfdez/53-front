import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContestsService } from './contest.service';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth-form/services/auth.service';

@Injectable()
export class SelectedContestGuardService implements CanActivate {
    constructor(
        private contestService: ContestsService,
        private router: Router,
        private auth: AuthService,
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.auth.authenticated.pipe(
            switchMap((auth) => {
                return this.contestService.getSelectedContest();
            }),
            map((contest) => {
                if (contest === undefined || !contest) {
                    this.router.navigate(['portal/portal']);
                } else {
                    return true;
                }
            })
        );
    }
}