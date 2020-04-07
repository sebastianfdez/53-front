import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth-form/services/auth.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class JudgeAuthGuardService implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean> | boolean {
        return this.authService.isJudge().pipe(
            tap((isJudge) => {
                if (!isJudge) {
                    this.router.navigate(['portal/admin']);
                }
            }),
        );
    }
}
