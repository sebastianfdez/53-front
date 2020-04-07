import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { Subscription, from, of } from 'rxjs';
import { Store } from 'store';
import { Judge } from '../../models/categorie';
import { Contest } from '../../../shared/models/contest';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';
import { ComponentUtils } from '../../../shared/services/component-utils';

@Component({
    selector: 'app-judges',
    templateUrl: './judges.component.html',
    styleUrls: ['./judges.component.scss'],
})
export class JudgesComponent implements OnInit, OnDestroy {
    judges: Judge[] = [];

    contestId = '';

    contest: Contest = null;

    editing = false;

    loading = false;

    loadingChanges = false;

    addJudge = false;

    newJudge: Judge = {
        name: '',
        id: '',
        lastName: '',
        mail: '',
        role: 'judge',
        contest: '',
    };

    errorMessage: string;

    subscriptions: Subscription[] = [];

    constructor(
        private firebaseService: FirebaseService,
        private route: ActivatedRoute,
        private snackBarService: SnackBarService,
        private componentUtils: ComponentUtils,
        private store: Store,

    ) { }

    ngOnInit() {
        // eslint-disable-next-line no-undef
        this.contestId = localStorage.getItem('contestId');
        this.loading = true;
        this.subscriptions.push(
            this.route.data.subscribe((judges: {judges: Judge[];}) => {
                this.judges = judges.judges;
                this.loading = false;
            }),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    editJudges() {
        this.loadingChanges = true;
        setTimeout(() => {
            this.editing = !this.editing;
            this.loadingChanges = false;
        }, 800);
    }

    saveJudges() {
        this.judges.forEach((judge) => this.firebaseService.updateJudge(judge));
        this.loadingChanges = true;
        setTimeout(() => {
            this.editing = !this.editing;
            this.loadingChanges = false;
        }, 800);
    }

    async sendJudge() {
        this.loadingChanges = true;
        try {
            this.createJudgeUser();
            this.snackBarService.showMessage(`Profil juge créé pour le mail ${this.newJudge.mail}.
                Envoyez le lien de connexion à ${this.newJudge.name} ${this.newJudge.lastName}`);
        } catch (err) {
            console.log(err);
            this.errorMessage = err.message;
            this.snackBarService.showError(this.errorMessage);
            this.loadingChanges = false;
        }
    }

    createJudgeUser() {
        const { judges } = this.store.value.selectedContest;
        judges.push(this.newJudge.mail);
        this.newJudge.contest = this.contestId;
        this.subscriptions.push(
            this.firebaseService.updateContest(this.contestId, { judges }).pipe(
                tap(() => {
                    this.judges.push(JSON.parse(JSON.stringify(this.newJudge)));
                    this.loadingChanges = false;
                    this.addJudge = false;
                }),
                switchMap(() => from(this.firebaseService
                    .createJudge(this.newJudge.mail, this.newJudge))),
                catchError(() => {
                    this.snackBarService.showMessage(`L'e-mail ${this.newJudge.mail} est déjà utilisé`);
                    this.addJudge = false;
                    this.loadingChanges = false;
                    return of(null);
                }),
            ).subscribe(),
        );
    }

    deleteJudge(judge: Judge) {
        this.contest.judges = this.contest.judges.filter((j) => j !== judge.id);
        this.firebaseService.updateContest(this.contestId, this.contest);
        this.firebaseService.deleteJudge(judge.id);
    }

    copyLink(judge: Judge) {
        this.componentUtils.copyText(
            `https://la53.fr/auth/inscription?contestId=${this.store.value.selectedContest.id}&email=${judge.mail}`,
        );
    }
}
