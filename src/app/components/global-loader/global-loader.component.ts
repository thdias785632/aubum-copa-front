import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Subscription } from 'rxjs';

import { LoadingService } from '../../infra/loading/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('180ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('popIn', [
      transition(':enter', [
        animate(
          '420ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          keyframes([
            style({ opacity: 0, transform: 'scale(0.5) translateY(24px)', offset: 0 }),
            style({ opacity: 1, transform: 'scale(1.05) translateY(-6px)', offset: 0.7 }),
            style({ opacity: 1, transform: 'scale(1) translateY(0)', offset: 1 }),
          ]),
        ),
      ]),
    ]),
  ],
})
export class GlobalLoaderComponent implements OnInit, OnDestroy {
  isVisible = false;
  message = '';

  private subs: Subscription[] = [];

  constructor(private loading: LoadingService) {}

  ngOnInit(): void {
    this.subs.push(
      this.loading.isLoading$.subscribe((v) => (this.isVisible = v)),
      this.loading.message$.subscribe((m) => (this.message = m)),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
