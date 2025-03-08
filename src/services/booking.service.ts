import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private apiService: ApiService) {}

  addNewBooking(data: any): Observable<any> {
    return this.apiService.post('/booking/new', data);
  }

  getBookingList(from: number = 0): Observable<any> {
    return this.apiService.post('/booking', { from });
  }
}
