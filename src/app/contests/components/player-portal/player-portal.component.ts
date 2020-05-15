import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import {
    switchMap, map, tap,
} from 'rxjs/operators';
import {
    combineLatest, Observable,
} from 'rxjs';
import { AuthService } from 'src/app/auth/auth-form/services/auth.service';
import { User } from 'src/app/shared/models/user';
import { ContestsService } from '../../services/contest.service';
import { Categorie, Participant } from '../../models/categorie';

@Component({
    selector: 'app-player-portal',
    templateUrl: './player-portal.component.html',
})
export class PlayerPortalComponent implements OnInit {
    playerForm: FormGroup = null;

    participant$: Observable<Participant> = null;

    constructor(
        private contestService: ContestsService,
        private authService: AuthService,
        private formBuilder: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.participant$ = combineLatest<Observable<User>, Observable<Categorie[]>>(
            this.authService.getAuthenticatedUser(),
            this.contestService.getSelectedContest().pipe(
                switchMap((contest) => combineLatest(
                    contest.categories.map((cat) => this.contestService.getCategorie(cat)),
                )),
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
                                return categories[i].pools[j].participants[k];
                            }
                        }
                    }
                }
                return null;
            }),
            tap((participant: Participant) => {
                console.log(participant);
                this.playerForm = this.formBuilder.group({
                    name: participant.name,
                    lastName: participant.lastName,
                    club: participant.club,
                    mail: participant.mail,
                    videoLink: participant.videoLink,
                });
            }),
        );
    }

    update() {
        console.log(this.playerForm.value);
    }
}
