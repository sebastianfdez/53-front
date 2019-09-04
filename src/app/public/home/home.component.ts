import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  animations: [
    trigger('openClose', [
      // ...
      state('open', style({
        transform: 'translate(0, 0)',
      })),
      state('closed', style({
        transform: 'translate(0, -100%)',
      })),
      transition('open => closed', [
        animate('0.2s')
      ]),
      transition('closed => open', [
        animate('0.2s')
      ]),
    ]),
  ],
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  showSticky = true;
  bottomMenu = false;
  bottomMenu2 = false;

  @ViewChild('header') header: ElementRef;
  @ViewChild('carrousel') carrousel: ElementRef;

  constructor() { }

  ngOnInit() {
    this.setHeaderAnimation();
  }

  setHeaderAnimation() {
    window.addEventListener('scroll', ((event) => {
      pageYOffset = (event.target as HTMLElement).scrollTop;
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
