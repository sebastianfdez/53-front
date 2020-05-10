/* eslint-disable no-undef */
import { Component, OnInit } from '@angular/core';
import { from, of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from 'store';
import {
    tap, take, switchMap, filter, catchError, map,
} from 'rxjs/operators';
import { AuthService } from '../auth-form/services/auth.service';
import { User } from '../../shared/models/user';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Contest } from '../../shared/models/contest';

@Component({
    selector: 'app-password-less-auth',
    templateUrl: './password-less-auth.component.html',
    styleUrls: ['./password-less-auth.component.scss'],
})
export class PasswordLessAuthComponent implements OnInit {
    user: User = null;

    email: string;

    emailUrl: string;

    speaker = false;

    errorMessage: string;

    contestId = '';

    emailSent = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private store: Store,
        private firebaseService: FirebaseService,
    ) {}

    ngOnInit() {
        this.store.select<User>('user').pipe(
            tap((user) => {
                this.user = user;
            }),
        ).subscribe();
        const { url } = this.router;
        this.route.queryParams.subscribe((params) => {
            this.contestId = params.contestId;
            this.emailUrl = params.email;
            if (params.speaker === 'true' || params.speaker === true) {
                window.localStorage.setItem('speaker', 'true');
                this.speaker = true;
            }
        });
        this.confirmSignIn(url);
    }

    async confirmSignIn(url: string) {
        try {
            if (!this.authService.confirmSignIn(url)) {
                return;
            }
            if (!window.localStorage.getItem('emailForSignIn')) {
                return;
            }
            this.emailUrl = window.localStorage.getItem('emailForSignIn');
            this.emailSent = true;
            this.contestId = window.localStorage.getItem('contestId');
            this.speaker = window.localStorage.getItem('speaker') === 'true';
            const judge: User = {
                contest: [this.contestId],
                id: '',
                lastName: '',
                name: '',
                mail: this.emailUrl,
                role: {},
                autenticated: true,
                participant: false,
            };
            from<Promise<firebase.auth.UserCredential>>(
                this.authService.signInWithLink(this.emailUrl, url).catch((error) => {
                    console.log(error);
                    this.errorMessage = error;
                    return null;
                }),
            ).pipe(
                map((result) => {
                    judge.id = result.user.uid;
                    judge.role[this.contestId] = this.speaker ? 'speaker' : 'judge';
                }),
                switchMap(() => this.authService.getAuthenticatedUser()),
                filter((user) => user !== null),
                tap((user) => {
                    judge.name = user.name;
                    judge.lastName = user.lastName;
                }),
                take(1),
                switchMap(() => this.firebaseService.createNewJudge(judge, judge.id)),
                switchMap(() => from(this.firebaseService.deleteJudge(this.emailUrl))),
                catchError((error) => {
                    console.log(error);
                    return of(null);
                }),
                take(1),
                switchMap(() => this.firebaseService.getContest(this.contestId)),
                take(1),
            ).subscribe((contest: Contest) => {
                window.localStorage.removeItem('emailForSignIn');
                window.localStorage.removeItem('contestId');
                if (this.speaker) {
                    this.firebaseService
                        .updateContest(this.contestId, { speaker: judge.id });
                } else {
                    let judges: string[] = contest.judges.filter((judge_) => judge_ !== judge.mail);
                    judges.push(judge.id);
                    judges = Array.from(new Set(judges));
                    this.firebaseService.updateContest(this.contestId, { judges });
                }
            });
        } catch (err) {
            this.errorMessage = err.message;
        }
    }

    async sendEmailLink() {
        try {
            await this.authService.sendLogInLink(
                this.emailUrl,
            );
            window.localStorage.setItem('emailForSignIn', this.emailUrl);
            window.localStorage.setItem('contestId', this.contestId);
            if (this.speaker) {
                window.localStorage.setItem('speaker', 'true');
            }
            this.emailSent = true;
        } catch (err) {
            this.errorMessage = err.message;
            console.log(err);
        }
    }

    goToHome() {
        this.router.navigate(['portal/portal']);
    }
}
