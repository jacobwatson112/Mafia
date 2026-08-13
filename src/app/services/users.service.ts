import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from '../models/user.models';

interface UsersResponse {
  users: User[];
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly usersApiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<UsersResponse>(this.usersApiUrl).pipe(
      map((response) => (response?.users ?? []).map((user) => ({ name: user.name }))),
    );
  }

  saveUsers(users: User[]): Observable<User[]> {
    const payload: UsersResponse = {
      users: users.map((user) => ({ name: user.name })),
    };

    return this.http.put<UsersResponse>(this.usersApiUrl, payload).pipe(
      map((response) => (response?.users ?? []).map((user) => ({ name: user.name }))),
    );
  }
}
