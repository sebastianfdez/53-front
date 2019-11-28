import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth-form/services/auth.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ComponentUtils } from '../../../shared/services/component-utils';
import { SnackBarService } from '../../../shared/services/snack-bar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  error: string;
  loging = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private componentUtils: ComponentUtils,
    private snackBarService: SnackBarService,
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      user: ['', Validators.required],
      pass: ['', Validators.required],
    });
  }

  async login() {
    this.loging = true;
    if (this.loginForm.valid) {
      try {
        this.authService.signIn(this.loginForm.value.user, this.loginForm.value.pass).subscribe((succes) => {
          if (succes) {
            this.router.navigate(['portal/admin']);
          } else {
            this.loging = false;
            this.snackBarService.showError('Erreur de connexion');
          }
        });
      } catch (err) {
        console.log(err);
        this.error = err.message;
      }
    }
  }

  get passwordInvalid() {
    const control = this.loginForm.get('pass');
    return control.hasError('required') && control.touched;
  }

  get emailFormat() {
    const control = this.loginForm.get('user');
    return control.touched && (control.hasError('required') || !this.componentUtils.validateEmail(control.value));
  }

}
