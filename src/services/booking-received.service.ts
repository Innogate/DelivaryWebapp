import { payload } from './../../interfaces/payload.interface';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingReceivedService {
  constructor(private apiService: ApiService) {}

  addNewBookingReceived(payload: any): Observable<any> {
    return this.apiService.post('/booking/received/new', payload);
  }

  getResivedBookings(payload: any): Observable<any> {
    return this.apiService.post('/booking/received', payload);
  }

  forward(bookingId: number): Observable<any> {
    return this.apiService.post('/booking/forward', { booking_id: bookingId });
  }


  outDelidery(payload: any): Observable<any> {
    return this.apiService.post('/delivery/new/booking', payload);
  }
}
