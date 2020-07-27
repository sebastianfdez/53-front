import { Injectable } from '@angular/core';
import {
    Router, CanActivate,
} from '@angular/router';
import {
    Observable, of,
} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class ConnectedGuardService implements CanActivate {
    constructor(
        private auth: AuthService,
        private router: Router,
    ) {}

    canActivate(): Observable<boolean> | boolean {
        return this.auth.authenticated.pipe(
            switchMap((value) => {
                if (!value) {
                    return of(true);
                }
                this.router.navigate(['portal/portal']);
                return of(false);
            }),
        );
    }
}
