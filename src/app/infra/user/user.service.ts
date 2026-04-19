import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserGateway } from '../../domain/user/gateway/user.gateway';
import { CreateUser, Login, User } from '../../domain/user/dto/user.dto';

@Injectable({ providedIn: 'root' })
export class UserService implements UserGateway {
  private apiUrl = environment.apiUrl;
  private storageKey = '@AUbumCopa:User';

  constructor(private http: HttpClient) {}

  login(data: Login): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user/login`, data);
  }

  createUser(data: CreateUser): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/user/create`, data);
  }

  setUser(user: User): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem(this.storageKey);
    return user ? (JSON.parse(user) as User) : null;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }
}
