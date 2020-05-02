/* eslint-disable no-undef */
import {
    Component, OnInit, ElementRef, ViewChild,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';
import { AnimationService } from '../services/animation.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    constructor(
        private titleService: Title,
        private animationService: AnimationService,
    ) {}

    showSticky = true;

    bottomMenu = false;

    @ViewChild('header', { static: true }) header: ElementRef;

    @ViewChild('homecont', { static: true }) homecont: ElementRef;

    public version: string = environment.version;

    ngOnInit() {
        this.titleService.setTitle('La 53 - Home');
        this.setHeaderAnimation();
    }

    setHeaderAnimation() {
        window.addEventListener('scroll', ((event) => {
            const pageYOffset = (event.target as HTMLElement).scrollTop;
            if (pageYOffset > window.innerHeight) {
                this.header.nativeElement.classList.add('sticky');
                this.homecont.nativeElement.classList.add('sticky');
                this.showSticky = true;
                if (pageYOffset > 2 * window.innerHeight) {
                    this.bottomMenu = true;
                } else {
                    this.bottomMenu = false;
                }
            } else {
                this.header.nativeElement.classList.remove('sticky');
                this.homecont.nativeElement.classList.remove('sticky');
                this.showSticky = false;
                this.bottomMenu = false;
            }
        }), true);
    }

    elementInViewport(element: HTMLElement) {
        return this.animationService.elementInViewport(element);
    }
}
