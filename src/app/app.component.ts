import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    route: ActivatedRoute,
  ) {
    route.fragment.subscribe((route_) => {
      if (route.children[0] && route.children[0].routeConfig.path === 'home') {
        document.body.classList.add('body2');
      } else {
        document.body.classList.remove('body2');
      }
    });
  }
}
