import { Component, OnInit, OnDestroy } from '@angular/core';
import {
    Subscription, of,
} from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { Store } from 'store';
import { Title } from '@angular/platform-browser';
import { Contest } from '../../../shared/models/contest';
import { AuthService } from '../../../auth/auth-form/services/auth.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';
import { User, emptyUser } from '../../../shared/models/user';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ContestsService } from '../../services/contest.service';
import { ComponentUtils } from '../../../shared/services/component-utils';

@Component({
    selector: 'app-speaker',
    templateUrl: './speaker.component.html',
})
export class SpeakerComponent implements OnInit, OnDestroy {
    contest: Contest = null;

    user: User = null;

    contestId = '';

    speaker: User = null;

    addSpeaker = false;

    newMail = '';

    public loadingSave = false;

    subscriptions: Subscription[] = [];

    constructor(
        private authService: AuthService,
        private snackBarService: SnackBarService,
        private store: Store,
        private firebaseService: FirebaseService,
        private contestService: ContestsService,
        private componentUtils: ComponentUtils,
        private titleService: Title,
    ) { }

    ngOnInit() {
        this.titleService.setTitle('La 53 - Speaker');
        // eslint-disable-next-line no-undef
        this.subscriptions.push(
            this.authService.getAuthenticatedUser().pipe(
                switchMap(() => this.contestService.getSelectedContest()),
                switchMap((contest) => {
                    this.contest = contest;
                    this.contestId = contest.id;
                    if (this.contest.speaker !== undefined && this.contest.speaker !== '') {
                        return this.contestService.getSpeaker();
                    }
                    return of(null);
                }),
            ).subscribe(
                (speaker) => {
                    if (speaker) {
                        this.speaker = speaker;
                    }
                },
            ),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    saveSpeaker() {
        this.loadingSave = true;
        try {
            this.createSpeakerUser();
            this.snackBarService.showMessage(`Profile juge créé pour ${this.speaker.mail}.
                    Envoyez le lien de connexion à ${this.speaker.name} ${this.speaker.lastName}`);
        } catch (err) {
            console.log(err);
            this.snackBarService.showError('Une erreur est survenue');
            this.loadingSave = false;
        }
    }

    createSpeakerUser() {
        this.speaker = emptyUser;
        this.speaker.contest = [this.contest.id];
        this.speaker.role = {};
        this.speaker.id = this.newMail;
        this.speaker.mail = this.newMail;
        this.speaker.role[this.contestId] = 'speaker';
        this.subscriptions.push(
            this.firebaseService.createJudge(this.speaker, this.contest.id).pipe(
                switchMap((speaker) => {
                    this.store.set('speaker', speaker);
                    this.speaker = speaker;
                    return this.firebaseService
                        .updateContest(this.contestId, { speaker: speaker.id });
                }),
                tap(() => {
                    this.loadingSave = false;
                    this.addSpeaker = false;
                }),
                catchError(() => {
                    this.snackBarService.showMessage(`L'e-mail ${this.speaker.mail} est déjà utilisé`);
                    this.addSpeaker = false;
                    this.loadingSave = false;
                    return of(null);
                }),
            ).subscribe(),
        );
    }

    copyLink() {
        this.componentUtils.copyText(
            `https://la53.fr/auth/inscription?contestId=${this.store.value.selectedContest.id}&email=${this.speaker.mail}&speaker=true`,
        );
    }

    deleteSpeaker() {
        this.subscriptions.push(
            this.snackBarService.showMessage(
                `Êtes-vous sûr de bien vouloir supprimer ${this.speaker.name} comme juge?`, 'Oui',
            ).onAction().pipe(
                switchMap(() => {
                    const updatedSpeaker = this.speaker;
                    updatedSpeaker.contest = updatedSpeaker.contest
                        .filter((c) => c !== this.contest.id);
                    delete updatedSpeaker.role[this.contest.id];
                    return this.firebaseService.updateUser(this.speaker.id, updatedSpeaker);
                }),
                switchMap(() => {
                    this.contest.speaker = '';
                    this.speaker = null;
                    this.store.set('speaker', null);
                    return this.firebaseService.updateContest(this.contestId, this.contest);
                }),
                tap(() => this.snackBarService.showMessage('Speaker supprimé du contest avec succès')),
                tap(() => {
                    this.speaker = null;
                }),
                catchError((error) => {
                    console.log(error);
                    return of(false);
                }),
            ).subscribe(),
        );
    }
}
