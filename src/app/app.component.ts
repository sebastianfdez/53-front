import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('body') body: HTMLElement;

  constructor(
    route: ActivatedRoute,
  ) {
    route.fragment.subscribe((route_) => {
      console.log(route.children[0] ? route.children[0].routeConfig.path : '');
      if (route.children[0] && route.children[0].routeConfig.path === 'home') {
        console.log(this.body);
      }
    });
  }
}
