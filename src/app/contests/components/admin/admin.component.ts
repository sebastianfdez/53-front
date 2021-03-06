/* eslint-disable no-unused-expressions */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { switchMap, map, filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { User } from '../../../shared/models/user';
import { AuthService } from '../../../auth/auth-form/services/auth.service';
import { Contest } from '../../../shared/models/contest';
import { ContestsService } from '../../services/contest.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
    contest: Contest = null;

    admin$: Observable<User> = null;

    subscriptions: Subscription[] = [];

    isAdmin = false;

    isJudge = false;

    user: User = null;

    public loading = false;

    constructor(
        private contestService: ContestsService,
        private router: Router,
        private authService: AuthService,
        private titleService: Title,
    ) {
    }

    ngOnInit() {
        this.loading = true;
        this.admin$ = this.authService.getAuthenticatedUser();
        this.subscriptions.push(
            this.admin$.pipe(
                filter((user) => user !== null),
                switchMap((user) => {
                    this.user = user;
                    return this.contestService.getSelectedContest();
                }),
                map((contest) => {
                    this.contest = contest;
                    this.isJudge = this.user.role[contest.id] === 'judge';
                    this.isAdmin = this.user.role[contest.id].indexOf('admin') >= 0;
                    // eslint-disable-next-line no-undef
                    localStorage.setItem('contestId', this.contest.id);
                    this.loading = false;
                    this.titleService.setTitle(`La 53 - ${this.contest.name}`);
                }),
            ).subscribe(),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    goToJudges() {
        this.router.navigate(['portal/judges']);
    }

    goToContest() {
        this.isAdmin || this.isJudge
            ? this.router.navigate(['portal/contests'])
            : this.router.navigate(['portal/speaker']);
    }
}
