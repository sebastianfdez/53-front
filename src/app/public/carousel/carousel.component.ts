import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  images = [1, 2, 3, 4].map(() => `https://picsum.photos/1900/900?random&t=${Math.random()}`);

  constructor() { }

  ngOnInit() {
  }

}
