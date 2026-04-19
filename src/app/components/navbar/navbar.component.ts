import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserGateway } from '../../domain/user/gateway/user.gateway';
import { UserService } from '../../infra/user/user.service';
import { User } from '../../domain/user/dto/user.dto';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  providers: [{ provide: UserGateway, useClass: UserService }],
})
export class NavbarComponent {
  user: User | null = null;
  scrolled = false;
  menuOpen = false;

  constructor(
    private userService: UserGateway,
    private router: Router
  ) {
    this.user = this.userService.getUser();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 12;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['']);
  }
}
