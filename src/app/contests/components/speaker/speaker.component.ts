import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, of, from, combineLatest } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { Contest } from '../../../shared/models/contest';
import { Speaker, emptySpeaker } from '../../models/speaker';
import { AuthService } from '../../../auth/auth-form/services/auth.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';
import { Store } from '../../../store';
import { User } from '../../../shared/models/user';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ContestsService } from '../../services/contest.service';
import { ComponentUtils } from '../../../shared/services/component-utils';

@Component({
    selector: 'app-speaker',
    templateUrl: './speaker.component.html',
    styleUrls: ['./speaker.component.scss']
})
export class SpeakerComponent implements OnInit, OnDestroy {

    contest: Contest = null;
    user: User = null;
    contestId = '';
    speaker: Speaker = null;
    noSpeaker = true;
    addSpeaker = false;

    public loading = false;
    public loadingSave = false;

    subscriptions: Subscription[] = [];

    constructor(
        private authService: AuthService,
        private snackBarService: SnackBarService,
        private store: Store,
        private firebaseService: FirebaseService,
        private contestService: ContestsService,
        private componentUtils: ComponentUtils,
    ) { }

    ngOnInit() {
        this.loading = true;
        this.contestId = localStorage.getItem('contestId');
        this.subscriptions.push(
            this.authService.getAuthenticatedUser().pipe(
                switchMap((user) => {
                    return this.contestService.getContest(user.contest);
                }),
                switchMap((contest) => {
                    this.contest = contest;
                    if (this.contest.speaker !== undefined && this.contest.speaker !== '') {
                        this.noSpeaker = false;
                        this.speaker = emptySpeaker;
                        this.addSpeaker = true;
                        return this.contestService.getSpeaker();
                    }
                    this.addSpeaker = false;
                    return of(emptySpeaker);
                })
            ).subscribe(
                (speaker) => {
                    this.loading = false;
                    this.speaker = speaker;
                    this.speaker.id = this.noSpeaker ? '' : this.contest.id;
                }
            )
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    isSaveDisabled(): boolean {
        return this.addSpeaker ? this.speaker.name.length < 5 || this.speaker.lastName.length < 5 ||
        this.speaker.mail.length < 5 : false;
    }

    saveSpeaker() {
        if (this.noSpeaker && !this.addSpeaker) {
            this.addSpeaker = true;
        } else {
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
    }

    createSpeakerUser() {
        this.speaker.contest = this.contest.id;
        this.subscriptions.push(
            this.firebaseService.updateContest(this.contestId, {speaker: this.speaker.mail}).pipe(
                tap(() => {
                    this.loadingSave = false;
                    this.noSpeaker = false;
                    this.addSpeaker = false;
                }),
                switchMap(() => {
                    return from(this.firebaseService.createJudge(this.speaker.mail, this.speaker));
                }),
                catchError(() => {
                    this.snackBarService.showMessage(`L'e-mail ${this.speaker.mail} est déjà utilisé`);
                    this.addSpeaker = false;
                    this.loadingSave = false;
                    return of(null);
                })
            ).subscribe()
        );
    }

    copyLink() {
        this.componentUtils.copyText(
          `https://la53.fr/auth/inscription?contestId=${this.store.value.contest.id}&email=${this.speaker.mail}&speaker=true`);
    }

}
