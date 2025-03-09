import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { BookingService } from '../../../../../services/booking.service';
import { AlertService } from '../../../../../services/alert.service';

@Component({
  selector: 'app-booking-status',
  imports: [CommonModule],
  templateUrl: './booking-status.component.html',
  styleUrl: './booking-status.component.scss'
})
export class BookingStatusComponent {

    bookingList?: any[];
constructor (private bookService: BookingService, private alertService: AlertService){

}

ngOnInit() {
  this.GetAllBooking();
}

  async GetAllBooking() {
    await firstValueFrom(this.bookService.getBookingList(0).pipe(
      tap(
        (res) => {
          if (res.body) {
            if (res.body) {
              this.bookingList = res.body;
            }
            console.log(res.body);
          }
        },
        (error) => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }
}

