import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { BookingService } from '../../../../../services/booking.service';
import { AlertService } from '../../../../../services/alert.service';
import { StateService } from '../../../../../services/state.service';
import { CityService } from '../../../../../services/city.service';
import { BranchService } from '../../../../../services/branch.service';
import { GlobalStorageService } from '../../../../../services/global-storage.service';

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
    private branchService: BranchService,
    private storage: GlobalStorageService
  ) { }

  async ngOnInit() {
    this.storage.set('PAGE_TITLE', "BOOKING LIST");
    await this.getAllBooking();
  }

  async getAllBooking() {
    try {
      await firstValueFrom(this.bookService.getBookingList({
        felid: [],
        current: this.current,
        max: this.max
      }).pipe(
        tap(
          (res) => {
            if (res?.body && Array.isArray(res.body)) {
              this.current = res.body.length;
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

  getCityName(cityId: number): string {
    const cities = this.storage.get('cities') as { city_id: number; city_name: string }[] || [];
    const city = cities.find(city => city.city_id === cityId);
    return city ? city.city_name : ''; // Return city name or empty string if not found
  }

  transportModes = [
    { label: 'Bus', value: 'B' },
    { label: 'Train', value: 'T' },
    { label: 'Flight', value: 'F' },
    { label: 'Cab', value: 'C' }
  ];

  getTransportModeLabel(value: string): string {
    const mode = this.transportModes.find(mode => mode.value === value);
    return mode ? mode.label : value;
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

  async onScroll(event: any): Promise<void> {
    const bottom = event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
    if (bottom) {
      await this.getAllBooking();
    }
  }

  async cancelOder(bookingId: number) {
    await firstValueFrom(this.bookService.cancelBooking(bookingId).pipe(
      tap(
        (res) => {
          if (res?.body) {
            this.alertService.success(res.body.message);
            // remove this booking from list
            this.bookingList = this.bookingList?.filter(booking => booking?.booking_id !== bookingId);
          }
        }
      )
    ))
  }
}
