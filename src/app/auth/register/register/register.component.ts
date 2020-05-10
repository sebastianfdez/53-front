import { Component, OnInit, OnDestroy } from '@angular/core';
import {
    FormBuilder, FormGroup, Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import {
    tap, filter,
} from 'rxjs/operators';
import { AuthService } from '../../auth-form/services/auth.service';
import { ComponentUtils } from '../../../shared/services/component-utils';
import { User } from '../../../shared/models/user';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';
import { TypeContests } from '../../../shared/models/type-contests';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit, OnDestroy {
    registerForm: FormGroup;

    error: string;

    types: string[] = [];

    registerToContest = '';

    subscriptions: Subscription[] = [];

    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private componentUtils: ComponentUtils,
        private firebaseService: FirebaseService,
        private snackBarService: SnackBarService,
        private router: Router,
        private titleService: Title,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.types = Object.keys(TypeContests)
            .map((key) => TypeContests[key])
            .filter((val) => val.length > 1);
        this.titleService.setTitle('La 53 - Register');
        this.registerForm = this.fb.group({
            user: ['', Validators.required],
            pass: ['', Validators.required],
            passconf: ['', Validators.required],
            name: ['', Validators.required],
            lastName: ['', Validators.required],
        }, { validators: this.samePassword });
        this.subscriptions.push(
            this.route.queryParams.subscribe((data) => {
                if (data.contest) {
                    this.registerToContest = data.contest;
                }
            }),
        );
    }

    async register() {
        this.loading = true;
        try {
            const user: firebase.auth.UserCredential = await this.authService
                .createUser(this.registerForm.value.user, this.registerForm.value.pass);
            this.createContestUser(user);
        } catch (err) {
            console.log(err);
            this.error = err.message;
            this.loading = false;
        }
    }

    async createContestUser(user: firebase.auth.UserCredential) {
        const newUser: User = {
            id: user.user.uid,
            mail: user.user.email,
            name: this.registerForm.value.name,
            lastName: this.registerForm.value.lastName,
            role: {},
            contest: [],
            autenticated: false,
        };
        if (this.registerToContest) {
            newUser.role[this.registerToContest] = 'player';
            newUser.contest.push(this.registerToContest);
        }
        await this.firebaseService.createUser(newUser);
        this.subscriptions.push(
            this.authService.authState$.pipe(
                filter((user_) => user_ !== undefined),
                tap((user_) => {
                    if (user_) {
                        this.snackBarService.showMessage('Utilisateur créé avec succès');
                        if (this.registerToContest) {
                            this.router.navigate(['inscription'], { preserveQueryParams: true });
                        } else {
                            this.router.navigate(['portal']);
                        }
                    }
                    this.loading = false;
                }),
            ).subscribe(),
        );
    }

    // eslint-disable-next-line class-methods-use-this
    samePassword(group: FormGroup) {
        const differentPassword = group.controls.pass.value !== group.controls.passconf.value;
        return differentPassword ? { differentPassword: true } : null;
    }

    get passwordInvalid() {
        const control = this.registerForm.get('pass');
        return control.hasError('required') && control.touched;
    }

    get emailFormat() {
        const control = this.registerForm.get('user');
        return control.touched && (control.hasError('required') || !this.componentUtils.validateEmail(control.value));
    }

    get confirmPasswordInvalid() {
        const control = this.registerForm.get('passconf');
        return this.registerForm.hasError('differentPassword') && control.touched;
    }

    get nameInvalid() {
        const control = this.registerForm.get('name');
        const control2 = this.registerForm.get('lastName');
        return (control.hasError('required') && control.touched) || (control2.hasError('required') && control2.touched);
    }

    get disableButton() {
        return this.registerForm.invalid;
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }
}
