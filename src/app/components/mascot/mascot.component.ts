import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  style,
  transition,
  trigger,
  state,
} from '@angular/animations';

@Component({
  selector: 'app-mascot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mascot.component.html',
  styleUrl: './mascot.component.scss',
  animations: [
    trigger('mascotEntry', [
      state('hidden', style({ opacity: 0, transform: 'translateY(30px) scale(0.85)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      transition('hidden => visible', [
        animate('700ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'),
      ]),
    ]),
    trigger('bubblePop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.6) translateY(10px)' }),
        animate(
          '320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' })),
      ]),
    ]),
  ],
})
export class MascotComponent implements AfterViewInit, OnDestroy {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() bubble?: string;
  @Input() wag = true;
  @Input() glow = true;

  @ViewChild('mascotEl') mascotEl?: ElementRef<HTMLElement>;

  state: 'hidden' | 'visible' = 'hidden';

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (!this.mascotEl?.nativeElement) {
      this.state = 'visible';
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.state = 'visible';
          }
        });
      },
      { threshold: 0.2 }
    );

    this.observer.observe(this.mascotEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
