import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { payload } from '../../interfaces/payload.interface';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private apiService: ApiService) {}

  getAllToken(payload: any): Observable<any> {
    return this.apiService.post('/credit/token',  payload);
  }

//   getStateById(payload: payload): Observable<any> {
//     return this.apiService.post('/master/states/byId', payload);
//   }

  addNewToken(payload: any): Observable<any> {
    return this.apiService.post('/credit/token/new', payload);
  }

  deleteToken(id: number): Observable<any> {
    return this.apiService.post('/credit/token/delete', { token_id: id });
  }

//   updateState(payload: any): Observable<any> {
//     return this.apiService.post('/master/states/update',  payload);
//   }
}
