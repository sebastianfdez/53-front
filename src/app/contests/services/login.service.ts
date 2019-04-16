import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class LoginService {

    public loginSuccesfull: Subject<boolean> = new Subject();

    public sendLoginSucces() {
        this.loginSuccesfull.next(true);
    }
}
