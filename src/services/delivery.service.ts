import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class deliveryService {
  constructor(private apiService: ApiService) {}

  addNewDelivery(data: any): Observable<any> {
    return this.apiService.post('/delivery/new', data);
  }


  fetchDelivery(): Observable<any> {
    return this.apiService.get('/delivery/new/list');
  }
  
}
