import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent implements OnInit {

  @Input() bottomMenu: boolean;
  @Input() bottomMenu2: boolean;

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      const el = document.getElementById('start-logo');
      console.log(el);
      if (el && el as HTMLElement) {
        console.log((el as any).inert);
        (el as any).inert = true;
        console.log((el as any).inert);
      }
    }, 1000);
  }

}
