import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { AlbumComponent } from './views/album/album.component';
import { RepetidasComponent } from './views/repetidas/repetidas.component';
import { ProfileComponent } from './views/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardGuard } from './guards/dashboard.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'album', component: AlbumComponent, canActivate: [DashboardGuard] },
  {
    path: 'repetidas',
    component: RepetidasComponent,
    canActivate: [DashboardGuard],
  },
  {
    path: 'perfil',
    component: ProfileComponent,
    canActivate: [DashboardGuard],
  },
  { path: '**', redirectTo: '' },
];
