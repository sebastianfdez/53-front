import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Contest } from 'src/app/shared/models/contest';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { User } from 'src/app/shared/models/user';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth-form/services/auth.service';
import { switchMap, tap, take } from 'rxjs/operators';
import { ContestsService } from '../../services/contest.service';

@Component({
    selector: 'app-portal',
    templateUrl: './portal.component.html',
})
export class PortalComponent implements OnInit {
    contests$: Observable<Contest[]> = null;

    subscriptions: Subscription[] = [];

    user: User = null;

    isAdmin = false;

    isJudge = false;

    loading = true;

    constructor(
        private contestService: ContestsService,
        private router: Router,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.contests$ = this.authService.getAuthenticatedUser().pipe(
            take(1),
            tap(() => {
                this.loading = true;
            }),
            switchMap((user) => {
                this.user = user;
                this.cdr.detectChanges();
                return combineLatest(
                    user.contest.map((contest) => this.contestService.getContest(contest)),
                );
            }),
            tap(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }),
        );
    }

    goTo(contest: Contest) {
        this.contestService.selectContest(contest);
        // eslint-disable-next-line no-undef
        window.localStorage.setItem('selectedContest', contest.id);
        this.router.navigate(['/portal/admin']);
    }

    async logOut() {
        await this.authService.logOut();
        this.router.navigate(['home']);
    }
}
