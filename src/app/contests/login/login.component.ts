import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public user = '';
  public pass = '';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
  }

  login() {
    this.authService.refreshAuth();
    this.authService.signIn(this.user, this.pass).then(
      (value: auth.UserCredential) => {
        this.router.navigate(['/admin']);
      }, (error) => {
        console.log('Error', error);
      }
    );
  }

}
