import {
    Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { switchMap, catchError, tap } from 'rxjs/operators';
import {
    Subscription, from, of, Observable,
} from 'rxjs';
import { Store } from 'store';
import { Title } from '@angular/platform-browser';
import { Contest } from '../../../shared/models/contest';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';
import { ComponentUtils } from '../../../shared/services/component-utils';
import { User } from '../../../shared/models/user';

@Component({
    selector: 'app-judges',
    templateUrl: './judges.component.html',
    styleUrls: ['./judges.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JudgesComponent implements OnInit, OnDestroy {
    judges$: Observable<User[]> = null;

    contestId = '';

    contest: Contest = null;

    loading = false;

    addJudge = false;

    newJudge: User = {
        name: '',
        id: '',
        lastName: '',
        mail: '',
        role: {},
        contest: [],
        autenticated: false,
    };

    errorMessage: string;

    subscriptions: Subscription[] = [];

    constructor(
        private firebaseService: FirebaseService,
        private snackBarService: SnackBarService,
        private componentUtils: ComponentUtils,
        private store: Store,
        private titleService: Title,
        private cdr: ChangeDetectorRef,

    ) { }

    ngOnInit() {
        console.log(this.store.value);
        this.titleService.setTitle('La 53 - Judges');
        // eslint-disable-next-line no-undef
        this.contestId = localStorage.getItem('contestId');
        this.loading = true;
        this.judges$ = this.store.select<User[]>('judges').pipe(
            tap(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    async sendJudge() {
        this.loading = true;
        try {
            this.createJudgeUser();
            this.snackBarService.showMessage(`Profil juge créé pour le mail ${this.newJudge.mail}.
                Envoyez le lien de connexion à ${this.newJudge.name} ${this.newJudge.lastName}`);
        } catch (err) {
            console.log(err);
            this.errorMessage = err.message;
            this.snackBarService.showError(this.errorMessage);
            this.loading = false;
        }
    }

    createJudgeUser() {
        this.newJudge.contest = [this.contestId];
        this.newJudge.role = {};
        this.newJudge.role[this.contestId] = 'judge';
        this.subscriptions.push(
            this.store.select<User[]>('judges').pipe(
                switchMap((judges) => {
                    judges.push(this.newJudge);
                    return this.firebaseService
                        .updateContest(this.contestId, { judges: judges.map((j) => j.mail) });
                }),
                tap(() => {
                    this.loading = false;
                    this.addJudge = false;
                }),
                switchMap(() => from(this.firebaseService
                    .createJudge(this.newJudge.mail, this.newJudge))),
                catchError(() => {
                    this.snackBarService.showMessage(`L'e-mail ${this.newJudge.mail} est déjà utilisé`);
                    this.addJudge = false;
                    this.loading = false;
                    return of(null);
                }),
            ).subscribe(),
        );
    }

    deleteJudge(judge: User) {
        this.contest.judges = this.contest.judges.filter((j) => j !== judge.id);
        this.firebaseService.updateContest(this.contestId, this.contest);
        this.firebaseService.deleteJudge(judge.id);
    }

    copyLink(judge: User) {
        this.componentUtils.copyText(
            `https://la53.fr/auth/inscription?contestId=${this.store.value.selectedContest.id}&email=${judge.mail}`,
        );
    }
}
