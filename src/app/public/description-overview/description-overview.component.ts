import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Route, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/pluck';

@Component({
  selector: 'app-description-overview',
  templateUrl: './description-overview.component.html',
  styleUrls: ['./description-overview.component.scss']
})
export class DescriptionOverviewComponent implements OnInit {

  type: Observable<string> = this.route.params.pluck('type');

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    console.log(this.type);
  }

}
