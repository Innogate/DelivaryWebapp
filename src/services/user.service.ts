import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getAllUsers(from: number = 0): Observable<any> {
    return this.apiService.post('/master/users', { from });
  }

  addNewUser(data: any): Observable<any> {
    return this.apiService.post('/master/users/new', data);
  }

  deleteUser(userId: string): Observable<any> {
    return this.apiService.post('/master/users/delete', { user_id: userId });
  }
}
