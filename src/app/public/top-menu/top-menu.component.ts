import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-top-menu',
    templateUrl: './top-menu.component.html',
    styleUrls: ['./top-menu.component.scss'],
})
export class TopMenuComponent {
    @Input() bottomMenu: boolean;

    @Input() bottomMenu2: boolean;
}
