import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Contest } from 'src/app/shared/models/contest';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SnackBarService } from 'src/app/shared/services/snack-bar.service';
import { TypeContests } from '../../../shared/models/type-contests';
import { ContestsService } from '../../services/contest.service';

@Component({
    selector: 'app-new-contest',
    templateUrl: './new-contest.component.html',
})
export class NewContestComponent implements OnInit, OnDestroy {
    newContestForm: FormGroup = null;

    types: string[] = [];

    error: string;

    loading = false;

    subscriptions: Subscription[] = [];

    constructor(
        private formbuilder: FormBuilder,
        private titleService: Title,
        private constestService: ContestsService,
        private router: Router,
        private snackBarService: SnackBarService,
    ) {}

    ngOnInit() {
        this.types = Object.keys(TypeContests)
            .map((key) => TypeContests[key])
            .filter((val) => val.length > 1);
        this.titleService.setTitle('La 53 - New Contest');
        this.newContestForm = this.formbuilder.group({
            type: ['', Validators.required],
            contestName: ['', Validators.required],
            date: [(new Date()).getTime(), Validators.required],
            place: ['', Validators.required],
        });
        console.log(this.newContestForm);
    }

    get missingName() {
        const control = this.newContestForm.get('contestName');
        return control.hasError('required') && control.touched;
    }

    newContest() {
        const contest: Contest = {
            name: this.newContestForm.value.contestName,
            type: this.newContestForm.value.type,
            date: this.newContestForm.value.date,
            place: this.newContestForm.value.place,
            categories: [],
            admins: [],
            id: '',
            judges: [],
            speaker: '',
        };
        this.loading = true;
        this.subscriptions.push(
            this.constestService.newContest(contest).subscribe(() => {
                this.loading = false;
                this.snackBarService.showMessage('Contest Crée avec succès');
                this.router.navigate(['/portal/portal']);
            }),
        );
    }

    get disableButton() {
        return this.newContestForm.invalid;
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }
}
