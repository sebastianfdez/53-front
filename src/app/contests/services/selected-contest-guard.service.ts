import { Injectable } from '@angular/core';
import {
    CanActivate, Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ContestsService } from './contest.service';
import { AuthService } from '../../auth/auth-form/services/auth.service';

@Injectable()
export class SelectedContestGuardService implements CanActivate {
    constructor(
        private contestService: ContestsService,
        private router: Router,
        private auth: AuthService,
    ) {}

    canActivate(): Observable<boolean> | boolean {
        return this.auth.authenticated.pipe(
            switchMap(() => this.contestService.getSelectedContest()),
            map((contest) => {
                if (contest === undefined || !contest) {
                    this.router.navigate(['portal/portal']);
                    return false;
                }
                return true;
            }),
        );
    }
}
