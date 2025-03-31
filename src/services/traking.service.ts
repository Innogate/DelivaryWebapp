import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { payload } from '../../interfaces/payload.interface';

@Injectable({
  providedIn: 'root',
})
export class TrakingService {
  constructor(private apiService: ApiService) { }

//   getAllUsers(payload: any): Observable<any> {
//     return this.apiService.post('/master/users', payload);
//   }

//   addNewUser(data: any): Observable<any> {
//     return this.apiService.post('/master/users/new', data);
//   }

//   deleteUser(userId: string): Observable<any> {
//     return this.apiService.post('/master/users/delete', { user_id: userId });
//   }


//   updateUser(payload: any): Observable<any> {
//     return this.apiService.post('/master/users/update', payload);
//   }

//   gateMyInfo(): Observable<any> {
//     return this.apiService.get('/master/users/myInfo');
//   }


  updateTrakingStatus(payload: any): Observable<any> {
    return this.apiService.post('/track/update', payload);
  }

}
