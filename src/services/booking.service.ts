import { payload } from './../../interfaces/payload.interface';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private apiService: ApiService) { }

  addNewBooking(payload: any): Observable<any> {
    return this.apiService.post('/booking/new', payload);
  }

  getBookingList(payload: any): Observable<any> {
    return this.apiService.post('/booking', payload);
  }

  getBookingById(bookingId: number): Observable<any> {
    return this.apiService.post('/booking/details', { booking_id: bookingId });
  }

  GetConsigneebyMobileNumber(payload: any): Observable<any> {
    return this.apiService.post('/consignee/byMobile', payload);
  }

  CreateConsignee(payload: any): Observable<any> {
    return this.apiService.post('/consignee/new', payload);
  }


  CreateConsignor(payload: any): Observable<any> {
    return this.apiService.post('/consignor/new', payload);
  }

  GetConsignorbyMobileNumber(payload: any): Observable<any> {
    return this.apiService.post('/consignor/byMobile', payload);
  }

  searchConsignee(text: string): Observable<any> {
    return this.apiService.post('/autofill/newBooking', { search: text });
  }


  cancelBooking(id:any): Observable<any> {
    return this.apiService.post('/booking/cancel', { booking_id: id });
  }

}
