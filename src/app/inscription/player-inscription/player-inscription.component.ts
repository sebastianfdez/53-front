/* eslint-disable class-methods-use-this */
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { Contest } from '../../shared/models/contest';
import { Categorie, ParticipantPublic } from '../../contests/models/categorie';
import { SnackBarService } from '../../shared/services/snack-bar.service';
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
        private router: Router,
        private inscriptionService: InscriptionService,
        private snackBarService: SnackBarService,
        private titleService: Title,
    ) {}

    ngOnInit() {
        this.titleService.setTitle('La 53 - Participer au contest');
        this.isLoading = true;
        this.subscriptions.push(
            this.route.data.pipe(
                switchMap((contest) => {
                    this.contest = contest.contest;
                    this.playerInscriptionForm = this.formBuilder.group({
                        videoLink: ['', [Validators.required, this.videoLinkCheck()]],
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
        const player: ParticipantPublic = {
            name: this.user.name,
            lastName: this.user.lastName,
            club: this.playerInscriptionForm.value.place,
            id: this.user.id,
            licence: `${(new Date()).getTime()}${Math.floor(Math.random() * 899999 + 100000)}`,
            likes: '',
            videoLink: this.playerInscriptionForm.value.videoLink,
            mail: this.user.mail,
            votes: [],
            isUser: true,
            category: '',
            active: false,
        };
        this.subscriptions.push(
            this.inscriptionService.enrollContest(
                player,
                this.playerInscriptionForm.value.category,
            ).pipe(
                tap((enrolled) => {
                    this.isLoading = false;
                    if (enrolled) {
                        this.snackBarService.showMessage(`Félicitation! Vous venez de vous inscrire au contest: ${this.contest.name}`);
                    } else {
                        this.snackBarService.showError('Votre mail est déjà inscrit dans ce contest');
                    }
                    this.router.navigate(['']);
                }),
                catchError((error) => {
                    console.log(error);
                    this.isLoading = false;
                    this.snackBarService.showError('Une erreur est survenue');
                    return of(null);
                }),
            ).subscribe(),
        );
    }

    videoLinkCheck(): ValidationErrors {
        return (c: AbstractControl): {[key: string]: any;} => {
            if (
                (c.value as string).indexOf('youtube') > -1 || (c.value as string).indexOf('instagram') > -1
            ) return null;
            return { videoLinkCheck: { valid: false } };
        };
    }
}
