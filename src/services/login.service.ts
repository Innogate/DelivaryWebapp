import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GlobalStorageService } from './global-storage.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private apiService: ApiService,
    private storage: GlobalStorageService
  ) {}

  // Login function
  login(data:any): Observable<any> {
    return this.apiService.post('/login', data)
  }

  // Store the token after successful login
  storeToken(response: any): void {
    if (response && response.body && response.body.token) {
      this.storage.set('token', response.body.token. true);
    }
  }

  // Fetch token from storage
  getToken(): string | null {
    return this.storage.get('token') ?? null;
  }

  // Clear token (Logout function)
  logout(): void {
    this.storage.delete('token');
  }
  verify(): Observable<any> {
    return this.apiService.get('/verify').pipe(
      catchError((error) => {
        this.logout();
        return of(error);
      })
    );
  }
}
