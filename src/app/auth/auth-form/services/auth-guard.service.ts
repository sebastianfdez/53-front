import { Injectable } from '@angular/core';
import {
    Router, CanActivate, ActivatedRouteSnapshot,
} from '@angular/router';
import {
    Observable, of,
} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(
        private auth: AuthService,
        private router: Router,
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
    ): Observable<boolean> | boolean {
        return this.auth.authenticated.pipe(
            switchMap((value) => {
                if (value) {
                    return of(true);
                }
                const contest = route.queryParamMap.get('contest');
                if (contest) {
                    this.router.navigate(['auth/register'], { queryParams: { contest } });
                } else {
                    this.router.navigate(['home']);
                }
                return of(false);
            }),
        );
    }
}
