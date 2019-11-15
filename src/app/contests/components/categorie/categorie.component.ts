import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Categorie, Pool, Votes, Participant, emptyParticipant, emptyCategorie } from '../../models/categorie';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { from, Subscription } from 'rxjs';
import { WarningService } from 'src/app/shared/warning/warning.service';
import { WarningReponse } from 'src/app/shared/warning/warning.component';
import { FileRestrictions, UploadComponent, SelectEvent, UploadEvent } from '@progress/kendo-angular-upload';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})
export class CategorieComponent implements OnInit, OnDestroy {

  public createNew = false;
  public categorie: Categorie = JSON.parse(JSON.stringify(emptyCategorie));
  public contestId = '';

  public loading = false;
  public loadingSave = false;

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
  @ViewChild('UploadComponent') uploadComponent: UploadComponent;

  deletedPlayers: string[] = [];

  subscription: Subscription[] = [];

  test = false;

  constructor(
    private route: ActivatedRoute,
    private database: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    private warningService: WarningService,
  ) {
    this.isAdmin = this.authService.authStateUser ? this.authService.authStateUser.role === 'admin' : false;
    this.isJudge = this.authService.authStateUser ? this.authService.authStateUser.role === 'judge' : false;
    this.judgeCode = this.authService.authStateUser.id;
    this.judgeName = `${this.authService.authStateUser.name} ${this.authService.authStateUser.lastName}`;
    if (this.route.snapshot.routeConfig.path === 'categorie/:id/speaker') {
      this.isSpeaker = true;
    }
  }

  ngOnInit() {
    this.contestId = localStorage.getItem('contestId');
    this.subscription.push(
      this.route.data.subscribe((categorie: {categorie: Categorie}) => {
        if (!categorie.categorie) {
          this.categorie = emptyCategorie;
          this.createNew = true;
        } else {
          this.categorie = categorie.categorie;
        }
        this.categorie.pools = this.categorie.pools.filter(pool => pool.participants.length);
        this.categorie.pools.forEach((pool) => {
          pool.participants.forEach((participant) => {
            const vote: Votes = participant.votes
            .find(vote_ => vote_.codeJuge === this.judgeCode);
            this.votesRecord[`${participant.id}`] = vote ? vote.note : null;
          });
        });
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
      participant.id = `${(new Date()).getTime()}${Math.random() * 1000}`;
      pool.participants.push(participant);
    }
  }

  addPool() {
    if (!this.categorie.pools.length || this.categorie.pools[this.categorie.pools.length - 1].participants.length > 0 &&
      this.categorie.pools[this.categorie.pools.length - 1].participants[0].name !== '') {
      this.categorie.pools.push({ participants: [JSON.parse(JSON.stringify(emptyParticipant))]});
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
      this.database.collection('categories').add(this.categorie)
      .then((doc) => {
        this.database.collection('contests').doc(this.contestId).update({ newCategorie: doc.id });
        this.router.navigate(['/portal/contests']);
        this.loadingSave = false;
      });
    } else {
      this.database.collection('categories').doc(this.categorie.id).update(this.categorie)
      .then(() => {
        this.authService.isAdmin ? this.router.navigate(['/portal/admin']) : this.router.navigate(['/portal/contests']);
        this.loadingSave = false;
      });
    }
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
    this.subscription.push(
      from(this.database.collection('categories').doc(this.categorie.id).update(this.categorie)).subscribe(() => {
        this.router.navigate(['/portal/contests']);
        this.loadingSave = false;
      })
    );
  }

  goToScores() {
    this.router.navigate([`/portal/categorie/${this.categorie.id}/scores`]);
  }

  getVote(pool: Pool, i: number) {
    return this.votesRecord[`${pool.participants[i].id}`];
  }

  openUploeader() {
    this.warningService
    .showWarning(`Le tableau excel doit comporter des colonnes avec exactement les noms suivantes: 'nom', 'prenom', 'licence', 'club'`,
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
      const players: { nom: string; prenom: string; club: string; licence: string; }[] = XLSX.utils.sheet_to_json(worksheet, {raw: true});
      if (!players[0].nom || !players[0].prenom || !players[0].club || !players[0].licence) {
        let error = `Erreur: Colonnes pas trouvees: `;
        error += !players[0].nom ? 'nom, ' : '';
        error += !players[0].prenom ? 'prenom, ' : '';
        error += !players[0].club ? 'club, ' : '';
        !players[0].licence ? error += 'licence' : error.slice(0, error.length - 3);
        this.warningService.showWarning(error, false);
      } else {
        if (!this.categorie.pools.length) {
          this.categorie.pools.push({ participants: []});
        }
        players.sort((a , b) => 0.5 - Math.random());
        players.forEach((player) => {
          if (this.categorie.pools[this.categorie.pools.length - 1].participants.length < this.playersByPool) {
            this.categorie.pools[this.categorie.pools.length - 1].participants.push({
              id: `${(new Date()).getTime()}${Math.random() * 1000}`,
              votes: [],
              club: player.club,
              lastName: player.nom,
              name: player.prenom,
              licence: player.licence,
            });
          } else {
            this.categorie.pools.push({ participants: [{
              id: `${(new Date()).getTime()}${Math.random() * 1000}`,
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
