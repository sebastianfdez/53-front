import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Store } from 'store';
import {
    FormGroup, FormBuilder, Validators, FormArray,
} from '@angular/forms';
import { UrlSegment, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth-form/services/auth.service';
import {
    Categorie, emptyCategorie, Votes, Pool, ParticipantPublic,
} from '../../models/categorie';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';
import { ContestsService } from '../../services/contest.service';

@Component({
    selector: 'app-category-open',
    templateUrl: './category-open.component.html',
    styleUrls: ['../categorie/categorie.component.scss'],
})
export class CategoryOpenComponent implements OnInit, OnDestroy {
    // Roles
    public isAdmin = false;

    public isJudge = false;

    public judgeCode = '';

    public judgeName = '';

    public createNew = false;

    loading = false;

    loadingSave = false;

    // Object that stores connected judge votes
    public votesRecord: { [codeParticipant: string]: number; } = {};

    public categorie: Categorie = JSON.parse(JSON.stringify(emptyCategorie));

    categorieForm: FormGroup = this.formBuilder.group({
        name: this.formBuilder.control('', Validators.required),
        pools: this.formBuilder.array([]),
    });

    subscriptions: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private titleService: Title,
        private store: Store,
        private formBuilder: FormBuilder,
        private firebaseService: FirebaseService,
        private snackBarService: SnackBarService,
        private contestService: ContestsService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.loading = true;
        this.subscriptions.push(
            this.authService.isAdmin().subscribe((isAdmin) => {
                this.isAdmin = isAdmin;
            }),
            this.authService.isJudge().subscribe((isJudge) => {
                this.isJudge = isJudge;
            }),
            this.authService.getAuthenticatedUser().subscribe((user) => {
                this.judgeCode = user.id;
                this.judgeName = `${user.name} ${user.lastName}`;
            }),
            this.route.data.subscribe((categorie: { categorie: Categorie; }) => {
                this.createNew = !!(this.route.url as BehaviorSubject<UrlSegment[]>)
                    .value.filter((urls) => urls.path === 'new').length;
                if (!categorie.categorie || this.createNew) {
                    this.categorie = { ...emptyCategorie };
                } else {
                    this.categorie = categorie.categorie;
                }
                this.titleService.setTitle(`La 53 - ${this.categorie.name} - ${this.store.value.selectedContest.name}`);
                this.patchValue();
                this.categorieForm.get('pools').disable();
                this.loading = false;
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    patchValue(): void {
        this.categorie.pools = this.categorie.pools
            .filter((pool) => pool.participants.length);
        this.categorie.pools.forEach((pool) => {
            pool.participants.forEach((participant) => {
                const vote: Votes = participant.votes
                    ? participant.votes
                        .find((vote_) => vote_.codeJuge === this.judgeCode) : null;
                this.votesRecord[`${participant.id}`] = vote ? vote.note : null;
            });
        });
        this.categorieForm.patchValue({ name: this.categorie.name });
        this.patchPools();
    }

    patchPools(): void {
        this.categorie.pools.forEach((pool) => {
            this.addPoolForm(pool);
        });
        if (!this.isAdmin) {
            this.categorieForm.disable();
        }
    }

    addPoolForm(pool?: Pool) {
        this.pools.insert(this.pools.length, this.formBuilder.group({
            participants: this.formBuilder.array([]),
        }));
        if (pool) {
            pool.participants.forEach((participant: ParticipantPublic) => {
                this.addParticipant(this.pools.controls.length - 1, participant);
            });
        } else {
            this.addParticipant(this.pools.controls.length - 1);
        }
    }

    get pools(): FormArray {
        const array = this.categorieForm.get('pools') as FormArray;
        return array;
    }

    addParticipant(pool: number, participant?: ParticipantPublic) {
        const participantsForm = (this.pools.controls[pool].get('participants') as FormArray);
        participantsForm.insert(
            participantsForm.length,
            this.formBuilder.group({
                name: this.formBuilder.control(participant ? participant.name : '', [Validators.required, Validators.minLength(3)]),
                id: participant ? participant.id : '',
                votes: participant ? participant.votes : [],
                lastName: this.formBuilder.control(participant ? participant.lastName : '', Validators.required),
                videoLink: this.formBuilder.control(participant ? participant.videoLink : '', Validators.required),
                club: this.formBuilder.control(participant ? participant.club : '', Validators.required),
            }),
        );
    }

    get saveDisabled(): boolean {
        return this.categorieForm.value.name.length < 3;
    }

    saveVotes(): void {
        this.loadingSave = true;
        this.subscriptions.forEach((s) => s.unsubscribe());
        this.categorie.pools.forEach((pool) => {
            pool.participants.forEach((player) => {
                let vote: Votes = player.votes
                    ? player.votes.find((vote_) => vote_.codeJuge === this.judgeCode) : null;
                if (!vote) {
                    vote = {
                        codeJuge: this.judgeCode,
                        codeParticipant: player.licence,
                        nameJuge: this.judgeName,
                        note: 1,
                    };
                    player.votes.push(vote);
                }
                vote.note = this.votesRecord[`${player.id}`];
            });
        });
        this.firebaseService.updateCategorie(this.categorie)
            .then(() => {
                this.router.navigate(['/portal/contests']);
                this.loadingSave = false;
            })
            .catch((error) => {
                console.log(error);
                this.loadingSave = false;
                this.snackBarService.showError('Erreur de sauvegarde de la note');
            });
    }

    save(): void {
        if (this.categorieForm.invalid) {
            return;
        }
        this.loadingSave = true;
        this.categorie = { ...this.categorie, name: this.categorieForm.value.name };
        if (this.createNew) {
            this.categorie.contest = this.store.value.selectedContest.id;
            this.firebaseService.addCategorie(this.categorie)
                .then((doc) => {
                    this.contestService.addNewCategorie(this.categorie.contest, doc.id);
                    this.router.navigate(['/portal/contests']);
                    this.loadingSave = false;
                });
        } else {
            this.firebaseService.updateCategorie(this.categorie)
                .catch((error) => {
                    console.log(error);
                    this.loadingSave = false;
                    this.snackBarService.showError('Erreur de sauvegarde de la note');
                })
                .then(() => {
                    this.store.set(`categorie${this.categorie.id}`, this.categorie);
                    this.router.navigate(['/portal/contests']);
                    this.loadingSave = false;
                });
        }
    }
}
