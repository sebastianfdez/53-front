import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { Categorie, Pool, Votes, Participant, emptyParticipant, emptyCategorie } from '../../models/categorie';
import { AuthService } from '../../../auth/auth-form/services/auth.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { WarningService } from 'src/app/shared/warning/warning.service';
import { WarningReponse } from 'src/app/shared/warning/warning.component';
import { FileRestrictions, UploadComponent, SelectEvent, UploadEvent } from '@progress/kendo-angular-upload';
import * as XLSX from 'xlsx';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ContestsService } from '../../services/contest.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';
import { Store } from '../../../store';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})
export class CategorieComponent implements OnInit, OnDestroy {

  public createNew = false;
  public categorie: Categorie = JSON.parse(JSON.stringify(emptyCategorie));

  public loading = false;
  public loadingSave = false;

  // Object that stores connected judge votes
  public votesRecord: { [codeParticipant: string]: number } = {};

  // Roles
  public isAdmin = false;
  public isJudge = false;
  public isSpeaker = false;
  public judgeCode = '';
  public judgeName = '';

  // Upload
  myRestrictions: FileRestrictions = {
    allowedExtensions: ['.xls', '.xlsx']
  };
  showUploader = false;
  playersByPool = 1;
  @ViewChild('UploadComponent', { static: false }) uploadComponent: UploadComponent;

  deletedPlayers: string[] = [];

  subscription: Subscription[] = [];

  test = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private warningService: WarningService,
    private firebaseService: FirebaseService,
    private contestService: ContestsService,
    private snackBarService: SnackBarService,
    private store: Store,
  ) {
    if (this.route.snapshot.routeConfig.path === 'categorie/:id/speaker') {
      this.isSpeaker = true;
    }
  }

  ngOnInit() {
    this.subscription.push(
      this.authService.isAdmin().subscribe(isAdmin => this.isAdmin = isAdmin),
      this.authService.isJudge().subscribe(isJudge => this.isJudge = isJudge),
      this.authService.getAuthenticatedUser().subscribe((user) => {
        this.judgeCode = user.id;
        this.judgeName = `${user.name} ${user.lastName}`;
      }),
      this.route.data.subscribe((categorie: {categorie: Categorie}) => {
        this.createNew = !!(this.route.url as BehaviorSubject<UrlSegment[]>).value.filter(urls => urls.path === 'new').length;
        if (!categorie.categorie || this.createNew) {
          this.categorie = {...emptyCategorie};
        } else {
          this.categorie = categorie.categorie;
        }
        this.categorie.pools = this.categorie.pools.filter(pool => pool.participants.length);
        this.categorie.pools.forEach((pool) => {
          pool.participants.forEach((participant) => {
            const vote: Votes = participant.votes.find(vote_ => vote_.codeJuge === this.judgeCode);
            this.votesRecord[`${participant.id}`] = vote ? vote.note : null;
          });
        });
        // window.customElements.define('mat-form-field', CustomInput);
        // window.customElements.define('input', CustomInput);
        this.loading = false;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.forEach(s => s.unsubscribe());
  }

  addParticipant(pool: Pool) {
    if (pool.participants.length === 0 || pool.participants[pool.participants.length - 1].name !== '') {
      const participant: Participant = JSON.parse(JSON.stringify(emptyParticipant));
      participant.id = `${(new Date()).getTime()}${Math.floor(Math.random() * 899999 + 100000 )}`;
      pool.participants.push(participant);
    }
  }

  addPool() {
    if (!this.categorie.pools.length || this.categorie.pools[this.categorie.pools.length - 1].participants.length > 0 &&
      this.categorie.pools[this.categorie.pools.length - 1].participants[0].name !== '') {
        const participant: Participant = JSON.parse(JSON.stringify(emptyParticipant));
        participant.id = `${(new Date()).getTime()}${Math.floor(Math.random() * 899999 + 100000 )}`;
        this.categorie.pools.push({ participants: [participant]});
        setTimeout(() => {
          const inputs = document.getElementsByClassName('name-focus');
          (inputs[inputs.length -1] as HTMLInputElement).focus();
        }, 10);
    }
  }

  deleteParticipant(pool: Pool, i: number) {
    if (pool.participants[i].id !== '') {
      this.deletedPlayers.push(pool.participants[i].id);
    }
    pool.participants.splice(i, 1);
  }

  deletePool(j: number) {
    this.categorie.pools[j].participants.forEach((participant) => {
      if (participant.id) {
        this.deletedPlayers.push(participant.id);
      }
    });
    this.categorie.pools.splice(j, 1);
  }

  save() {
    this.loadingSave = true;
    this.subscription.forEach(s => s.unsubscribe());
    if (this.createNew) {
      this.categorie.contest = this.store.value.selectedContest.id;
      this.firebaseService.addCategorie(this.categorie)
      .then((doc) => {
        this.contestService.addNewCategorie(this.categorie.contest, doc.id );
        this.router.navigate(['/portal/contests']);
        this.loadingSave = false;
      });
    } else {
      this.firebaseService.updateCategorie(this.categorie)
      .catch((error) => {
        console.log(error);
        this.loadingSave = false;
        this.snackBarService.showError('Erreur de sauvegarde de la note');
      })
      .then(() => {
        this.authService.isAdmin ? this.router.navigate(['/portal/admin']) : this.router.navigate(['/portal/contests']);
        this.loadingSave = false;
      });
    }
  }

  get saveDisabled() {
    const nameOrPoolEmpty = this.categorie.name.length < 3 || this.categorie.pools.length < 1;
    const poolEmpty = this.categorie.pools.filter(p => p.participants.length === 0).length > 0;
    const playerEmpty = this.categorie.pools.filter(pool => pool.participants.filter(p => this.emptyPlayer(p)).length > 0).length > 0;
    return nameOrPoolEmpty || poolEmpty || playerEmpty;
  }

  emptyPlayer(p: Participant): boolean {
    return (!p.name.length || !p.lastName.length || !p.licence.length || !p.club.length);
  }

  valueChange(event: Event, id: string) {
    const value: number = (event.target as HTMLInputElement).value as any as number;
    if (value > 100) {
      this.votesRecord[id] = 100;
    } else if (value < 0) {
      this.votesRecord[id] = 0;
    } else if ((value * 100) % 1 !== 0) {
      this.votesRecord[id] = Math.floor(value * 100) / 100 ? Math.floor(value * 100) / 100 : 0;
    }
  }

  saveVotes() {
    this.loadingSave = true;
    this.subscription.forEach(s => s.unsubscribe());
    this.categorie.pools.forEach((pool) => {
      pool.participants.forEach((player) => {
        let vote: Votes = player.votes.find(vote_ => vote_.codeJuge === this.judgeCode);
        if (!vote) {
          vote = {
            codeJuge: this.judgeCode,
            codeParticipant: player.licence,
            nameJuge: this.judgeName,
            note: 1,
          };
          player.votes.push(vote);
        }
        vote.note = this.votesRecord[`${player.id}`];
      });
    });
    this.firebaseService.updateCategorie(this.categorie)
    .then(() => {
      this.router.navigate(['/portal/contests']);
      this.loadingSave = false;
    })
    .catch((error) => {
      console.log(error);
      this.loadingSave = false;
      this.snackBarService.showError('Erreur de sauvegarde de la note');
    });
  }

  goToScores() {
    this.router.navigate([`/portal/categorie/${this.categorie.id}/scores`]);
  }

  getVote(pool: Pool, i: number) {
    return this.votesRecord[`${pool.participants[i].id}`];
  }

  openUploeader() {
    this.warningService
    .showWarning(`Le tableau Excel doit comporter exactement les colonnes suivantes: 'nom', 'prenom', 'licence', 'club'`,
    true,
    'Combien de riders par poule?').afterClosed()
    .subscribe((response: WarningReponse) => {
      this.playersByPool = response ? response.input : 0;
      this.showUploader = response ? response.accept : false;
    });
  }

  fileSelected(event: SelectEvent) {
    this.uploadComponent.fileList.clear();
  }

  focusPool(index: number) {
    console.log(index);
    const el = document.getElementById('pool' + index);
    console.log(el);
  }

  // Import players from Excel
  uploadFile(event: UploadEvent) {
    event.preventDefault();
    this.showUploader = false;
    const excelFile: File = event.files[0].rawFile;
    const fr: FileReader = new FileReader();
    fr.onload = (event_) => {
      const bstr: ArrayBuffer = ((event_.target as FileReader).result) as ArrayBuffer;
      const datas = new Uint8Array(bstr);
      const arr = [];
      datas.forEach(data => arr.push(String.fromCharCode(data)));
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const first_sheet_name = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[first_sheet_name];
      // Create json list of players from excel
      const players: { nom: string; prenom: string; club: string; licence: string; }[] = XLSX.utils.sheet_to_json(worksheet, {raw: true});
      // Check the columns are well defined
      if (!players[0].nom || !players[0].prenom || !players[0].club || !players[0].licence) {
        let error = `Erreur: Il manque les colonnes suivantes: `;
        error += !players[0].nom ? 'nom, ' : '';
        error += !players[0].prenom ? 'prenom, ' : '';
        error += !players[0].club ? 'club, ' : '';
        !players[0].licence ? error += 'licence' : error.slice(0, error.length - 3);
        this.warningService.showWarning(error, false);
      } else {
        // If there is any pool already created we make the first one
        if (!this.categorie.pools.length) {
          this.categorie.pools.push({ participants: []});
        }
        // We sort randomly the players
        players.sort((a , b) => 0.5 - Math.random());
        players.forEach((player) => {
          if (this.categorie.pools[this.categorie.pools.length - 1].participants.length < this.playersByPool) {
            this.categorie.pools[this.categorie.pools.length - 1].participants.push({
              id: `${(new Date()).getTime()}${Math.floor(Math.random() * 899999 + 100000 )}`,
              votes: [],
              club: player.club,
              lastName: player.nom,
              name: player.prenom,
              licence: player.licence,
            });
          } else {
            this.categorie.pools.push({ participants: [{
              id: `${(new Date()).getTime()}${Math.floor(Math.random() * 899999 + 100000 )}`,
              votes: [],
              club: player.club,
              lastName: player.nom,
              name: player.prenom,
              licence: player.licence,
            }]});
          }
        });
      }
    };
    fr.readAsBinaryString(excelFile);
  }

}
