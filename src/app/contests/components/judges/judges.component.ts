import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Judge } from '../../models/categorie';
import { switchMap, catchError } from 'rxjs/operators';
import { Contest } from '../../models/contest';
import { combineLatest, Subscription, from, of } from 'rxjs';
import { WarningService } from 'src/app/shared/warning/warning.service';

@Component({
  selector: 'app-judges',
  templateUrl: './judges.component.html',
  styleUrls: ['./judges.component.scss']
})
export class JudgesComponent implements OnInit, OnDestroy {

  judges: Judge[] = [];
  contestId = '';
  contest: Contest = null;
  editing = false;
  loading = false;
  loadingChanges = false;
  addJudge = false;
  newJudge: Judge = {
    name: '',
    id: '',
    lastName: '',
    mail: '',
    role: 'judge',
    contest: '',
  };
  newJudgePassword = '';

  subscriptions: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private authService: AuthService,
    private warningService: WarningService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.contestId = localStorage.getItem('contestId');
    this.loading = true;
    this.subscriptions.push(
      this.route.data.subscribe((judges: {judges: Judge[]}) => {
        this.judges = judges.judges;
        this.loading = false;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  editJudges() {
    this.loadingChanges = true;
    setTimeout(() => {
      this.editing = !this.editing;
      this.loadingChanges = false;
    }, 800);
  }

  saveJudges() {
    this.judges.forEach(judge => this.db.collection('users').doc<Judge>(judge.id)
    .update({name: judge.name, lastName: judge.lastName}));
    this.loadingChanges = true;
    setTimeout(() => {
      this.editing = !this.editing;
      this.loadingChanges = false;
    }, 800);
  }

  toggleAddJudge() {
    if (this.authService.hasPassword()) {
      this.addJudge = true;
    } else {
      this.router.navigate(['login']);
    }
  }

  sendJudge() {
    this.loadingChanges = true;
    this.subscriptions.push(
      from(this.authService.createUser(this.newJudge.mail, this.newJudgePassword)).pipe(
        switchMap((user) => {
          this.contest.judges.push(user.user.uid);
          this.newJudge.contest = this.contestId;
          this.newJudge.id = user.user.uid;
          return combineLatest(
            from(this.db.collection<Judge>('users').doc<Judge>(user.user.uid).set(this.newJudge)),
            from(this.db.collection('contests').doc<Contest>(this.contestId).set(this.contest))
          );
        }),
        switchMap(([value, value2]) => {
          console.log({value, value2});
          return this.authService.relog();
        }),
        catchError((error) => {
          console.log(error);
          return of(error);
        }),
      ).subscribe((error) => {
        if (error) {
          this.warningService.showWarning(`Le mail ${this.newJudge.mail} est déjà utilisé`, false);
        } else {
          this.judges.push(JSON.parse(JSON.stringify(this.newJudge)));
        }
        this.newJudge = {
          name: '',
          id: '',
          lastName: '',
          mail: '',
          role: 'judge',
          contest: this.contestId,
        };
        this.addJudge = false;
        this.loadingChanges = false;
      })
    );
  }

  deleteJudge(judge: Judge) {
    this.contest.judges = this.contest.judges.filter(j => j !== judge.id);
    this.db.collection('contests').doc(this.contestId).set(this.contest);
    this.db.collection('users').doc(judge.id).delete();
  }

}
