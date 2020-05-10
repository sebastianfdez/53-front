import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Contest } from 'src/app/shared/models/contest';
import { Subscription } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { Categorie, Participant } from 'src/app/contests/models/categorie';
import { SnackBarService } from 'src/app/shared/services/snack-bar.service';
import { InscriptionService } from '../inscription.service';
import { User } from '../../shared/models/user';

@Component({
    selector: 'app-player-inscription',
    templateUrl: './player-inscription.component.html',
})
export class PlayerInscriptionComponent implements OnInit {
    playerInscriptionForm: FormGroup = null;

    constestId = '';

    contest: Contest = null;

    subscriptions: Subscription[] = [];

    isLoading = false;

    categories: { id: string; name: string; }[] = [];

    user: User = null;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private inscriptionService: InscriptionService,
        private snackBarService: SnackBarService,
    ) {}

    ngOnInit() {
        this.isLoading = true;
        this.subscriptions.push(
            this.route.data.pipe(
                switchMap((contest) => {
                    this.contest = contest.contest;
                    this.playerInscriptionForm = this.formBuilder.group({
                        videoLink: ['', Validators.required],
                        category: ['', Validators.required],
                        contestName: [this.contest.name, Validators.required],
                        place: ['', Validators.required],
                    });
                    this.playerInscriptionForm.get('contestName').disable();
                    this.isLoading = false;
                    return this.inscriptionService.getCategories(this.contest);
                }),
                tap((categories: Categorie[]) => {
                    this.categories = categories.map((c) => ({ id: c.id, name: c.name }));
                }),
            ).subscribe(),
            this.inscriptionService.getUser().pipe(
                tap((user) => {
                    this.user = user;
                }),
            ).subscribe(),
        );
    }

    get missingVideoLink() {
        const control = this.playerInscriptionForm.get('videoLink');
        return control.hasError('required') && control.touched;
    }

    get missingPlace() {
        const control = this.playerInscriptionForm.get('place');
        return control.hasError('required') && control.touched;
    }

    get missingCategory() {
        const control = this.playerInscriptionForm.get('category');
        return control.hasError('required') && control.touched;
    }

    get disableButton() {
        return this.playerInscriptionForm.invalid;
    }

    inscribeToContest() {
        if (this.playerInscriptionForm.invalid) {
            return;
        }
        this.isLoading = true;
        const player: Participant = {
            name: this.user.name,
            lastName: this.user.lastName,
            club: this.playerInscriptionForm.value.place,
            id: this.user.id,
            licence: '',
            likes: 0,
            videoLink: this.playerInscriptionForm.value.videoLink,
            mail: this.user.mail,
            votes: [],
            isUser: true,
        };
        this.subscriptions.push(
            this.inscriptionService.enrollContest(
                player,
                this.playerInscriptionForm.value.category,
            ).pipe(
                tap(() => {
                    this.isLoading = false;
                }),
            ).subscribe(),
        );
    }
}
