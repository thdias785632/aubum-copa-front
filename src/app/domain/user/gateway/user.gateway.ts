import { Observable } from 'rxjs';
import { CreateUser, Login, User } from '../dto/user.dto';

export abstract class UserGateway {
  abstract login(data: Login): Observable<User>;
  abstract createUser(data: CreateUser): Observable<void>;
  abstract setUser(user: User): void;
  abstract getUser(): User | null;
  abstract logout(): void;
}
