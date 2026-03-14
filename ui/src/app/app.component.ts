import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet [@pageAnimation]="getAnimationState()"></router-outlet>`,
  styleUrl: './app.component.css',
  animations: [
    trigger('pageAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(15px)'
        }),
        animate('400ms 100ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'translateY(-15px)'
        }))
      ])
    ])
  ]
})
export class AppComponent {
  constructor() {}

  getAnimationState() {
    return true;
  }
}
