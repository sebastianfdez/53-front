import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { Categorie, Pool, Votes, Participant, emptyParticipant, emptyCategorie } from '../../models/categorie';
import { AuthService } from '../../../auth/auth-form/services/auth.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { WarningService } from 'src/app/shared/warning/warning.service';
import { WarningReponse } from 'src/app/shared/warning/warning.component';
import { FileRestrictions, UploadComponent, SelectEvent, UploadEvent } from '@progress/kendo-angular-upload';
import * as XLSX from 'xlsx';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ContestsService } from '../../services/contest.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';
import { Store } from 'store';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, FormControl, ValidationErrors } from '@angular/forms';

@Component({
    selector: 'app-categorie',
    templateUrl: './categorie.component.html',
    styleUrls: ['./categorie.component.scss']
})
export class CategorieComponent implements OnInit, OnDestroy {

    public createNew = false;
    public categorie: Categorie = JSON.parse(JSON.stringify(emptyCategorie));

    public loading = false;
    public loadingSave = false;

    // Object that stores connected judge votes
    public votesRecord: { [codeParticipant: string]: number } = {};

    // Roles
    public isAdmin = false;
    public isJudge = false;
    public isSpeaker = false;
    public judgeCode = '';
    public judgeName = '';

    // Upload
    myRestrictions: FileRestrictions = {
        allowedExtensions: ['.xls', '.xlsx']
    };
    showUploader = false;
    playersByPool = 1;
    @ViewChild('UploadComponent', { static: false }) uploadComponent: UploadComponent;

    categorieForm: FormGroup = this.formBuilder.group({
        name: this.formBuilder.control('', Validators.required),
        pools: this.formBuilder.array([], Validators.required),
    });

    subscriptions: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private router: Router,
        private warningService: WarningService,
        private firebaseService: FirebaseService,
        private contestService: ContestsService,
        private snackBarService: SnackBarService,
        private store: Store,
        private formBuilder: FormBuilder,
    ) {
        if (this.route.snapshot.routeConfig.path === 'categorie/:id/speaker') {
            this.isSpeaker = true;
        }
    }

    ngOnInit() {
        this.subscriptions.push(
            this.authService.isAdmin().subscribe(isAdmin => this.isAdmin = isAdmin),
            this.authService.isJudge().subscribe(isJudge => this.isJudge = isJudge),
            this.authService.getAuthenticatedUser().subscribe((user) => {
                this.judgeCode = user.id;
                this.judgeName = `${user.name} ${user.lastName}`;
            }),
            this.route.data.subscribe((categorie: {categorie: Categorie}) => {
                this.createNew = !!(this.route.url as BehaviorSubject<UrlSegment[]>).value.filter(urls => urls.path === 'new').length;
                if (!categorie.categorie || this.createNew) {
                    this.categorie = {...emptyCategorie};
                } else {
                    this.categorie = categorie.categorie;
                }
                this.categorie.pools = this.categorie.pools.filter(pool => pool.participants.length);
                this.categorie.pools.forEach((pool) => {
                    pool.participants.forEach((participant) => {
                        const vote: Votes = participant.votes.find(vote_ => vote_.codeJuge === this.judgeCode);
                        this.votesRecord[`${participant.id}`] = vote ? vote.note : null;
                    });
                });
                this.loading = false;
                this.categorieForm.patchValue(this.categorie);
                this.categorie.pools.forEach((pool, i) => {
                    this.addPoolForm(pool);
                });
                if (!this.isAdmin) {
                    this.categorieForm.disable();
                }
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    deletePool(j: number) {
        (this.categorieForm.get('pools') as FormArray).controls.splice(j, 1);
    }

    save() {
        this.loadingSave = true;
        this.subscriptions.forEach(s => s.unsubscribe());
        if (this.createNew) {
            this.categorie.contest = this.store.value.selectedContest.id;
            this.firebaseService.addCategorie(this.categorie)
            .then((doc) => {
                this.contestService.addNewCategorie(this.categorie.contest, doc.id );
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
                this.authService.isAdmin ? this.router.navigate(['/portal/admin']) : this.router.navigate(['/portal/contests']);
                this.loadingSave = false;
            });
        }
    }

    get saveDisabled() {
        return !this.isValid(this.categorieForm);
        // const nameOrPoolEmpty = this.categorie.name.length < 3 || this.categorie.pools.length < 1;
        // const poolEmpty = this.categorie.pools.filter(p => p.participants.length === 0).length > 0;
        // const playerEmpty = this.categorie.pools.filter(pool => pool.participants.filter(p => this.emptyPlayer(p)).length > 0).length > 0;
        // return nameOrPoolEmpty || poolEmpty || playerEmpty;
    }

    isValid(form: AbstractControl) {
        if (!form.valid) {
            return false;
        }
        if ((form as FormGroup | FormArray).controls) {
            return Object.values((form as FormGroup | FormArray).controls)
                .reduce((valid, control) => {
                    return valid && this.isValid(control);
                }, true);
        }
        return true;
    }

    emptyPlayer(p: Participant): boolean {
        return (!p.name.length || !p.lastName.length || !p.licence.length || !p.club.length);
    }

    saveVotes() {
        this.loadingSave = true;
        this.subscriptions.forEach(s => s.unsubscribe());
        this.categorie.pools.forEach((pool) => {
            pool.participants.forEach((player) => {
                let vote: Votes = player.votes.find(vote_ => vote_.codeJuge === this.judgeCode);
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

    goToScores() {
        this.router.navigate([`/portal/categorie/${this.categorie.id}/scores`]);
    }

    getVote(pool: Pool, i: number) {
        return this.votesRecord[`${pool.participants[i].id}`];
    }

    openUploeader() {
        this.warningService
        .showWarning(`Le tableau Excel doit comporter exactement les colonnes suivantes: 'nom', 'prenom', 'licence', 'club'`,
        true,
        'Combien de riders par poule?').afterClosed()
        .subscribe((response: WarningReponse) => {
        this.playersByPool = response ? response.input : 0;
        this.showUploader = response ? response.accept : false;
        });
    }

    fileSelected(event: SelectEvent) {
        this.uploadComponent.fileList.clear();
    }

    // Import players from Excel
    uploadFile(event: UploadEvent) {
        event.preventDefault();
        this.showUploader = false;
        const excelFile: File = event.files[0].rawFile;
        const fr: FileReader = new FileReader();
        fr.onload = (event_) => {
            const bstr: ArrayBuffer = ((event_.target as FileReader).result) as ArrayBuffer;
            const datas = new Uint8Array(bstr);
            const arr = [];
            datas.forEach(data => arr.push(String.fromCharCode(data)));
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const first_sheet_name = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[first_sheet_name];
            // Create json list of players from excel
            const players: { nom: string; prenom: string; club: string; licence: string; }[] = XLSX.utils.sheet_to_json(worksheet, {raw: true});
            // Check the columns are well defined
            if (!players[0].nom || !players[0].prenom || !players[0].club || !players[0].licence) {
                let error = `Erreur: Il manque les colonnes suivantes: `;
                error += !players[0].nom ? 'nom, ' : '';
                error += !players[0].prenom ? 'prenom, ' : '';
                error += !players[0].club ? 'club, ' : '';
                !players[0].licence ? error += 'licence' : error.slice(0, error.length - 3);
                this.warningService.showWarning(error, false);
            } else {
                // If there is any pool already created we make the first one
                if (!this.categorie.pools.length) {
                    this.categorie.pools.push({ participants: []});
                }
                // We sort randomly the players
                players.sort((a , b) => 0.5 - Math.random());
                players.forEach((player) => {
                if (this.categorie.pools[this.categorie.pools.length - 1].participants.length < this.playersByPool) {
                    this.categorie.pools[this.categorie.pools.length - 1].participants.push({
                    id: `${(new Date()).getTime()}${Math.floor(Math.random() * 899999 + 100000 )}`,
                    votes: [],
                    club: player.club,
                    lastName: player.nom,
                    name: player.prenom,
                    licence: player.licence,
                    });
                } else {
                    this.categorie.pools.push({ participants: [{
                        id: `${(new Date()).getTime()}${Math.floor(Math.random() * 899999 + 100000 )}`,
                        votes: [],
                        club: player.club,
                        lastName: player.nom,
                        name: player.prenom,
                        licence: player.licence,
                    }]});
                }
                });
            }
        };
        fr.readAsBinaryString(excelFile);
    }

    addPoolForm(pool?: Pool) {
        this.pools.controls.push(this.formBuilder.group({
            participants: this.formBuilder.array([], this.minLengthArray(1)),
        }));
        if (pool) {
            pool.participants.forEach((participant) => {
                this.addParticipant(this.pools.controls.length - 1, participant);
            })
        } else {
            this.addParticipant(this.pools.controls.length - 1);
        }
        setTimeout(() => {
            // const inputs = document.getElementsByClassName('name-focus');
            // (inputs[inputs.length -1] as HTMLInputElement).focus();
        }, 10);
    }

    addParticipant(pool: number, participant?: Participant) {
        const participantsForm = (this.pools.controls[pool].get('participants') as FormArray);
        participantsForm.controls.push(
            this.formBuilder.group({
                name: this.formBuilder.control(participant ? participant.name : '', [Validators.required, Validators.minLength(3)]),
                id: participant ? participant.id : '',
                votes: [],
                club: this.formBuilder.control(participant ? participant.club : '', Validators.required),
                lastName: this.formBuilder.control(participant ? participant.lastName : '', Validators.required),
                licence: this.formBuilder.control(participant ? participant.licence : '', Validators.required),
            }),
        );
    }

    get pools(): FormArray {
        const array = this.categorieForm.controls['pools'] as FormArray;
        return array;
    }

    minLengthArray(min: number): ValidationErrors {
        return (c: AbstractControl): {[key: string]: any} => {
            if (c.value.length >= min)
                return null;
    
            return { 'minLengthArray': {valid: false }};
        }
    }

}
