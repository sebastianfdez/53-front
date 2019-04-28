import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription, of, from, combineLatest } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Contest } from '../../models/contest';
import { Speaker, emptySpeaker } from '../../models/speaker';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { WarningService } from 'src/app/shared/warning/warning.service';

@Component({
  selector: 'app-speaker',
  templateUrl: './speaker.component.html',
  styleUrls: ['./speaker.component.scss']
})
export class SpeakerComponent implements OnInit, OnDestroy {

  contest: Contest = null;
  contestId = '';
  speaker: Speaker = null;
  noSpeaker = true;
  addSpeaker = false;

  public loading = false;
  public loadingSave = false;

  subscriptions: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    private warningService: WarningService,
  ) { }

  ngOnInit() {
    this.loading = true;
    this.contestId = localStorage.getItem('contestId');
    this.subscriptions.push(
      this.db.collection('contests').doc<Contest>(this.contestId).snapshotChanges().pipe(
        switchMap((contest) => {
          this.contest = contest.payload.data();
          if (this.contest.speaker !== undefined && this.contest.speaker !== '') {
            this.noSpeaker = false;
            this.speaker = emptySpeaker;
            this.addSpeaker = true;
            return this.db.collection('users').doc<Speaker>(this.contest.speaker).valueChanges();
          }
          this.addSpeaker = false;
          return of(emptySpeaker);
        })
      ).subscribe(
        (speaker) => {
          this.loading = false;
          this.speaker = speaker;
          this.speaker.id = this.noSpeaker ? '' : this.contest.id;
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  isSaveDisabled(): boolean {
    return this.addSpeaker ?
    this.speaker.name.length < 5 || this.speaker.lastName.length < 5 || this.speaker.mail.length < 5 || this.speaker.password.length < 5 :
    false;
  }

  saveSpeaker() {
    this.loadingSave = true;
    if (this.noSpeaker && !this.addSpeaker) {
      if (this.authService.hasPassword()) {
        this.addSpeaker = true;
        this.loadingSave = false;
      } else {
        this.router.navigate(['login']);
      }
    } else if (this.noSpeaker && this.addSpeaker) {
      this.subscriptions.push(
        from(this.authService.createUser(this.speaker.mail, this.speaker.password)).pipe(
          switchMap((user) => {
            this.contest.speaker = user.user.uid;
            this.speaker.contest = this.contestId;
            this.speaker.id = user.user.uid;
            const prom1$: Promise<void> = this.db.collection<Speaker>('users').doc<Speaker>(user.user.uid).set(this.speaker);
            const prom2$: Promise<void> = this.db.collection('contests').doc(this.contestId).set(this.contest);
            return combineLatest(prom1$, prom2$);
          }),
          switchMap(() => {
            return this.authService.relog();
          }),
          catchError((error) => {
            console.log(error);
            return of(error);
          }),
        ).subscribe((error) => {
          if (error) {
            this.warningService.showWarning(`Le mail ${this.speaker.mail} est déjà utilisé`, false);
          }
          this.loadingSave = false;
        })
      );
    } else {
      this.db.collection('users').doc<Speaker>(this.speaker.id).update({name: this.speaker.name, lastName: this.speaker.lastName});
      this.loadingSave = true;
      setTimeout(() => {
        this.loadingSave = false;
      }, 800);
    }
  }

}
