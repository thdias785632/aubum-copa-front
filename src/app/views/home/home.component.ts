import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { MascotComponent } from '../../components/mascot/mascot.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { UserGateway } from '../../domain/user/gateway/user.gateway';
import { UserService } from '../../infra/user/user.service';
import { NotificationService } from '../../infra/notification/notification.service';

type Mode = 'login' | 'signup';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MascotComponent,
    LoaderComponent,
  ],
  providers: [{ provide: UserGateway, useClass: UserService }],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('cardFlip', [
      state('login', style({ transform: 'rotateY(0)' })),
      state('signup', style({ transform: 'rotateY(0)' })),
      transition('login <=> signup', [
        animate(
          '500ms ease-in-out',
          keyframes([
            style({ transform: 'rotateY(0)', offset: 0 }),
            style({ transform: 'rotateY(90deg)', offset: 0.5 }),
            style({ transform: 'rotateY(0)', offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('heroIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '700ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  mode: Mode = 'login';

  loginForm!: FormGroup;
  signupForm!: FormGroup;

  isLoading = false;

  bubblePhrases = [
    'AU AU! Bem-vindo ao AUbum da Copa!',
    'Vamos colar as figurinhas juntos?',
    'Que tal começar seu álbum agora?',
    'Pronto pra 2026? Eu estou!',
  ];
  currentBubble = this.bubblePhrases[0];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserGateway,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForms();

    setInterval(() => {
      const idx = Math.floor(Math.random() * this.bubblePhrases.length);
      this.currentBubble = this.bubblePhrases[idx];
    }, 4500);
  }

  buildForms(): void {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });

    this.signupForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  switchMode(mode: Mode): void {
    this.mode = mode;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.userService.login(this.loginForm.value).subscribe({
      next: (user) => {
        this.userService.setUser(user);
        this.notification.showMessage(
          `AU AU! Bem-vindo, ${user.name}!`,
          'success'
        );
        this.isLoading = false;
        this.router.navigate(['/album']);
      },
      error: (err) => {
        this.isLoading = false;
        this.notification.showMessage(
          err?.error?.message ?? 'Não consegui te achar, tenta de novo!',
          'error'
        );
      },
    });
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.userService.createUser(this.signupForm.value).subscribe({
      next: () => {
        this.notification.showMessage(
          'Cadastro feito! Agora é só entrar 🐕',
          'success'
        );
        this.loginForm.patchValue({
          email: this.signupForm.value.email,
          password: '',
        });
        this.signupForm.reset();
        this.isLoading = false;
        this.mode = 'login';
      },
      error: (err) => {
        this.isLoading = false;
        this.notification.showMessage(
          err?.error?.message ?? 'Esse email já está no álbum!',
          'error'
        );
      },
    });
  }
}
