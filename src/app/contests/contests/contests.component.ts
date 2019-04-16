import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Categorie, Judge } from '../models/categorie';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSelectChange } from '@angular/material';
import { timer } from 'rxjs';

@Component({
  selector: 'app-contests',
  templateUrl: './contests.component.html',
  styleUrls: ['./contests.component.scss']
})
export class ContestsComponent implements OnInit {

  items: Observable<any[]>;

  categories: Categorie[] = [];
  judges: Judge[] = [];
  selectedJudge: Judge = {
    code: '',
    name: '',
  };

  public loading = false;
  public loading2 = false;
  public isJudge = false;

  constructor(private db: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.loading = true;
    this.loading2 = true;
    if (this.route.snapshot.routeConfig.path === 'contests' || this.route.snapshot.routeConfig.path === 'admin') {
      this.isJudge = true;
    }
  }

  ngOnInit() {
    this.items = this.db.collection('categories').snapshotChanges();
    this.items.subscribe(actions => {
      this.categories = actions.map((action) => {
        const data: any = action.payload.doc.data();
        const id = action.payload.doc.id;
        data.id = id;
        return data;
      });
      this.loading = false;
    });
    this.db.collection('judges').valueChanges().subscribe((judges: Judge[]) => {
      this.judges = judges;
      if (localStorage.getItem('judgeCode')) {
        const judge: Judge = this.judges.find(judge_ => judge_.code === localStorage.getItem('judgeCode'));
        this.selectedJudge = judge ? judge : this.selectedJudge;
      }
      this.loading2 = false;
    });
  }

  changeJudge(event: MatSelectChange) {
    localStorage.setItem('judgeCode', event.value.code);
    localStorage.setItem('judgeName', event.value.name);
  }

  goTo(categorie: Categorie) {
    this.isJudge ? this.router.navigate([`/categorie/${categorie.id}/true`]) : this.router.navigate([`/categorie/${categorie.id}/speaker`]);
  }

}
