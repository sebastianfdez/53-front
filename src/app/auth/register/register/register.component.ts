import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { AuthService } from '../../auth-form/services/auth.service';
import { ComponentUtils } from '../../../shared/services/component-utils';
import { Contest } from '../../../shared/models/contest';
import { User } from '../../../shared/models/user';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {

    registerForm: FormGroup;
    error: string;
    types: string[] = ['Skate', 'Roller', 'BMX', 'Autre'];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private componentUtils: ComponentUtils,
        private firebaseService: FirebaseService,
        private snackBarService: SnackBarService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.registerForm = this.fb.group({
            user: ['', Validators.required],
            pass: ['', Validators.required],
            passconf: ['', Validators.required],
            type: ['', Validators.required],
            name: ['', Validators.required],
            lastName: ['', Validators.required],
            contestName: ['', Validators.required],
            date: [(new Date()).getTime(), Validators.required],
            place: ['', Validators.required]
        }, { validators: this.samePassword });
    }

    async register() {
        try {
            const user: firebase.auth.UserCredential =
                await this.authService.createUser(this.registerForm.value.user, this.registerForm.value.pass);
            this.createContestUser(user);
        } catch (err) {
            console.log(err);
            this.error = err.message;
        }
    }

    async createContestUser(user: firebase.auth.UserCredential) {
        const newContest: Contest = {
            id: '',
            admins: [user.user.email],
            categories: [],
            judges: [],
            name: this.registerForm.value.contestName,
            speaker: '',
            type: this.registerForm.value.type,
            date: this.registerForm.value.date,
            place: this.registerForm.value.place,
        };
        const newContest_ = await this.firebaseService.createContest(newContest);
        const newUser: User = {
            id: user.user.uid,
            mail: user.user.email,
            name: this.registerForm.value.name,
            lastName: this.registerForm.value.lastName,
            role: 'admin',
            contest: newContest_.id,
            autenticated: false,
        };
        await this.firebaseService.createUser(newUser);
        await this.firebaseService.updateContest(newContest_.id, {id: newContest_.id});
        this.snackBarService.showMessage('Utilisateur et contest créé avec succès');
        this.router.navigate(['auth/login']);
    }

    samePassword(group: FormGroup) {
        const differentPassword = group.controls['pass'].value !== group.controls['passconf'].value;
        return differentPassword ? {'differentPassword': true } : null;
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

    get missingName() {
        const control = this.registerForm.get('contestName');
        return control.hasError('required') && control.touched;
    }

    get disableButton() {
        return this.registerForm.invalid;
    }
}
