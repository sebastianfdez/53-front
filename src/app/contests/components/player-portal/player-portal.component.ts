import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
    switchMap, map, tap,
} from 'rxjs/operators';
import {
    combineLatest, Observable,
} from 'rxjs';
import { AuthService } from 'src/app/auth/auth-form/services/auth.service';
import { User } from 'src/app/shared/models/user';
import { SnackBarService } from 'src/app/shared/services/snack-bar.service';
import { ContestsService } from '../../services/contest.service';
import { Categorie, Participant } from '../../models/categorie';

@Component({
    selector: 'app-player-portal',
    templateUrl: './player-portal.component.html',
})
export class PlayerPortalComponent implements OnInit {
    playerForm: FormGroup = null;

    participant$: Observable<Participant> = null;

    loading = false;

    category: Categorie = null;

    constestName = '';

    idplayer = '';

    constructor(
        private contestService: ContestsService,
        private authService: AuthService,
        private formBuilder: FormBuilder,
        private snackbarService: SnackBarService,
    ) {}

    ngOnInit(): void {
        this.loading = true;
        this.participant$ = combineLatest<Observable<User>, Observable<Categorie[]>>(
            this.authService.getAuthenticatedUser(),
            this.contestService.getSelectedContest().pipe(
                switchMap((contest) => {
                    this.constestName = contest.name;
                    return combineLatest(
                        contest.categories.map((cat) => this.contestService.getCategorie(cat)),
                    );
                }),
            ),
        ).pipe(
            map((value) => {
                const categories: Categorie[] = value[1];
                for (let i = 0; i < categories.length; i++) {
                    //value[1][i].pools.forEach((pool) => {
                    for (let j = 0; j < categories[i].pools.length; j++) {
                        // value[1][i].pools[j].participants.forEach((participant) => {
                        for (let k = 0; k < categories[i].pools[j].participants.length; k++) {
                            if (categories[i].pools[j].participants[k].id === value[0].id) {
                                this.category = categories[i];
                                this.idplayer = value[0].id;
                                return categories[i].pools[j].participants[k];
                            }
                        }
                    }
                }
                return null;
            }),
            tap((participant: Participant) => {
                this.playerForm = this.formBuilder.group({
                    name: [participant.name, Validators.required],
                    lastName: [participant.lastName, Validators.required],
                    club: [participant.club, Validators.required],
                    mail: [participant.mail, Validators.required],
                    videoLink: [participant.videoLink, Validators.required],
                });
                this.loading = false;
            }),
        );
    }

    update() {
        this.loading = true;
        this.contestService.updatePlayer(this.category, { ...this.playerForm.value, id: this.idplayer }).then(() => {
            this.loading = false;
            this.playerForm.reset(this.playerForm.value);
        }).catch(() => {
            this.snackbarService.showError('Erreur de connexion');
            this.loading = false;
        });
    }
}
