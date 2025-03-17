import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { BookingService } from '../../../../../services/booking.service';
import { AlertService } from '../../../../../services/alert.service';
import { StateService } from '../../../../../services/state.service';
import { CityService } from '../../../../../services/city.service';

@Component({
  selector: 'app-booking-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-status.component.html',
  styleUrls: ['./booking-status.component.scss']
})
export class BookingStatusComponent implements OnInit {

  bookingList?: any[];
  current = 0;
  max = 10;

  constructor(
    private bookService: BookingService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.getAllBooking();
  }

  async getAllBooking() {
    try {
      await firstValueFrom(this.bookService.getBookingList({
        max: this.max,
        current: this.current,
      }).pipe(
        tap(
          (res) => {
            if (res?.body && Array.isArray(res.body)) {
              this.current += 10;
              this.bookingList = this.bookingList ? [...this.bookingList, ...res.body] : res.body;
            }
          },
          (error) => {
            this.alertService.error(error?.error?.message || 'An error occurred while fetching bookings.');
          }
        )
      ))


    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'An error occurred while fetching bookings.');
    }
  }

  calculateTotal(charges?: number, shipper?: number, other?: number, cgst?: number, sgst?: number, igst?: number): number {
    // Ensure all values are numbers, replace undefined/null with 0
    const c = Number(charges) || 0;
    const s = Number(shipper) || 0;
    const o = Number(other) || 0;
    const cgstVal = Number(cgst) || 0;
    const sgstVal = Number(sgst) || 0;
    const igstVal = Number(igst) || 0;

    const subtotal = c + s + o;
    const cgstAmount = (cgstVal / 100) * subtotal;
    const sgstAmount = (sgstVal / 100) * subtotal;
    const igstAmount = (igstVal / 100) * subtotal;

    return subtotal + cgstAmount + sgstAmount + igstAmount;
  }

  onScroll(event: any): void {
    const bottom = event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
    if (bottom) {
      this.getAllBooking();
    }
  }
}
