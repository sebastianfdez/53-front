import {
    Component, OnInit, OnDestroy,
} from '@angular/core';
import {
    switchMap, catchError, tap, take,
} from 'rxjs/operators';
import {
    Subscription, from, of, Observable, combineLatest,
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
})
export class JudgesComponent implements OnInit, OnDestroy {
    judges$: Observable<User[]> = null;

    contestId = '';

    contest: Contest = null;

    loading = false;

    addJudge = false;

    newJudge: User = null;

    errorMessage: string;

    subscriptions: Subscription[] = [];

    adminIsJudge = false;

    constructor(
        private firebaseService: FirebaseService,
        private snackBarService: SnackBarService,
        private componentUtils: ComponentUtils,
        private store: Store,
        private titleService: Title,
    ) { }

    ngOnInit() {
        this.titleService.setTitle('La 53 - Judges');
        this.loading = true;
        this.createEmptyJudge();
        this.store.select<Contest>('selectedContest').subscribe((contest) => {
            this.adminIsJudge = this.store.value.user.role[contest.id] === 'adminjudge';
            this.contest = contest;
            this.contestId = contest.id;
        });
        this.judges$ = this.store.select<User[]>('judges').pipe(
            tap(() => {
                this.loading = false;
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
        this.newJudge.id = this.newJudge.mail;
        this.newJudge.role[this.contestId] = 'judge';
        this.subscriptions.push(
            combineLatest(
                this.judges$,
                from(this.firebaseService.createJudge(this.newJudge, this.contest.id)),
            ).pipe(
                take(1),
                switchMap(([judges, newJudge]) => {
                    judges.push(newJudge);
                    this.store.set('judges', judges);
                    this.store.set('selectedContest', { ...this.contest, judges: judges.map((j) => j.id) });
                    return this.firebaseService
                        .updateContest(this.contestId, { judges: judges.map((j) => j.id) });
                }),
                tap(() => {
                    this.loading = false;
                    this.addJudge = false;
                }),
                catchError(() => {
                    this.addJudge = false;
                    this.loading = false;
                    return of(null);
                }),
            ).subscribe(() => {
                this.snackBarService.showMessage(`Profil juge créé pour le email ${this.newJudge.mail}.
                    Envoyez le lien de connexion à ${this.newJudge.name} ${this.newJudge.lastName}`);
                this.createEmptyJudge();
            }),
        );
    }

    createEmptyJudge() {
        this.newJudge = {
            name: '',
            id: '',
            lastName: '',
            mail: '',
            role: {},
            contest: [],
            autenticated: false,
            participant: false,
        };
    }

    deleteJudge(judge: User) {
        this.subscriptions.push(
            this.snackBarService.showMessage(
                `Êtes-vous sûr de bien vouloir supprimer ${judge.name} comme juge?`, 'Oui',
            ).onAction().pipe(
                switchMap(() => {
                    this.contest.judges = this.contest.judges.filter((j) => j !== judge.id);
                    this.store.set('judges', this.store.value.judges.filter((j) => j.id !== judge.id));
                    return this.firebaseService.updateContest(this.contestId, this.contest);
                }),
                switchMap(() => {
                    const updatedJudge = judge;
                    updatedJudge.contest = updatedJudge.contest
                        .filter((c) => c !== this.contest.id);
                    delete updatedJudge.role[this.contest.id];
                    return this.firebaseService.updateUser(judge.id, updatedJudge);
                }),
                tap(() => this.snackBarService.showMessage('Juge supprimé du contest avec succès')),
                catchError((error) => {
                    console.log(error);
                    return of(false);
                }),
            ).subscribe(),
        );
    }

    copyLink(judge: User) {
        this.componentUtils.copyText(
            `https://la53.fr/auth/inscription?contestId=${this.store.value.selectedContest.id}&email=${judge.mail}`,
        );
    }

    addUserAsJudge() {
        this.loading = true;
        this.subscriptions.push(
            this.judges$.pipe(
                take(1),
                tap((judges) => this.firebaseService.updateContest(this.contestId,
                    { judges: judges.map((j) => j.id).concat(this.store.value.user.id) })),
                tap(() => {
                    const roles = this.store.value.user.role;
                    roles[this.contestId] = 'adminjudge';
                    return this.firebaseService.updateUser(
                        this.store.value.user.id, { ...this.store.value.user, role: roles },
                    );
                }),
                tap((judges) => this.store
                    .set('judges', judges.concat(this.store.value.user))),
            ).subscribe(() => {
                this.loading = false;
            }),
        );
    }
}
