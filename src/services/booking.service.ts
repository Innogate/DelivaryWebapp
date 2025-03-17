import { payload } from './../../interfaces/payload.interface';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private apiService: ApiService) {}

  addNewBooking(payload: any): Observable<any> {
    return this.apiService.post('/booking/new', payload);
  }

  getBookingList(): Observable<any> {
    return this.apiService.post('/booking', {});
  }

  getBookingById(bookingId: number): Observable<any> {
    return this.apiService.post('/booking/details', { booking_id: bookingId });
  }
}
