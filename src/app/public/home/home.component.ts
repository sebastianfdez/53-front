/* eslint-disable no-undef */
import {
    Component, OnInit, ElementRef, ViewChild,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    constructor(
        private titleService: Title,
    ) {}

    showSticky = true;

    bottomMenu = false;

    bottomMenu2 = false;

    @ViewChild('header', { static: true }) header: ElementRef;

    @ViewChild('carrousel', { static: true }) carrousel: ElementRef;

    public version: string = environment.version;

    ngOnInit() {
        this.titleService.setTitle('La 53 - Home');
        this.setHeaderAnimation();
    }

    setHeaderAnimation() {
        window.addEventListener('scroll', ((event) => {
            const pageYOffset = (event.target as HTMLElement).scrollTop;
            if (pageYOffset > 200) {
                this.showSticky = false;
                if (pageYOffset > window.innerHeight) {
                    this.header.nativeElement.classList.add('sticky');
                    this.carrousel.nativeElement.classList.add('sticky');
                    this.showSticky = true;
                    this.bottomMenu = true;
                    if (pageYOffset > 2 * window.innerHeight) {
                        this.bottomMenu2 = true;
                    } else {
                        this.bottomMenu2 = false;
                    }
                } else {
                    this.header.nativeElement.classList.remove('sticky');
                    this.carrousel.nativeElement.classList.remove('sticky');
                    this.showSticky = false;
                }
            } else {
                this.showSticky = true;
                this.bottomMenu = false;
                this.bottomMenu2 = false;
            }
        }), true);
    }
}
