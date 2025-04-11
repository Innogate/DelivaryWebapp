import { Component } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { BookingService } from '../../../../../services/booking.service';
import { AlertService } from '../../../../../services/alert.service';
import { BranchService } from '../../../../../services/branch.service';
import { GlobalStorageService } from '../../../../../services/global-storage.service';
import { CommonModule } from '@angular/common';
import { TrakingService } from '../../../../../services/traking.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingReceivedService } from '../../../../../services/booking-received.service';
import { InputTextModule } from 'primeng/inputtext';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-booking-resive',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './booking-resive.component.html',
  styleUrl: './booking-resive.component.scss'
})
export class BookingResiveComponent {

  bookingList?: any[];
  current = 0;
  max = 10000;
  showAddState: boolean = false;
  stateId?: number;
  isEditing: boolean = false;



  bookingReceivedForm: FormGroup;
  constructor(
    private bookService: BookingService,
    private alertService: AlertService,
    private branchService: BranchService,
    private storage: GlobalStorageService,
    private trakingService: TrakingService,
    private BookingresiveService: BookingReceivedService,
    private fb: FormBuilder,
  ) {
    this.bookingReceivedForm = this.fb.group({
      slip_no: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.storage.set('PAGE_TITLE', "BOOKING RECEIVED");
    await this.getAllResivedBookings();
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

  // Gate all Bookings Recieved
  async getAllResivedBookings() {
    try {
      const payload = {
        fields: [],
        max: this.max,
        current: 0
      }
      await firstValueFrom(this.BookingresiveService.getResivedBookings(payload).pipe(
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


  // Accept Booking
  async acceptBooking() {
    if (this.bookingReceivedForm.invalid) {
      this.alertService.error('Please enter slip number');
      return;
    }
    try {
      const payload = {
        slip_no: this.bookingReceivedForm.value.slip_no,
      }
      await firstValueFrom(this.BookingresiveService.addNewBookingReceived(payload).pipe(
        tap(
          async (res) => {
            if (res) {
              Swal.fire({
                title: 'Success',
                text: res.message,
                icon: 'success',
                timer: 800, // Auto close after 1 second
                showConfirmButton: false
              });
              this.bookingList = [];
              if (this.bookingList === null || this.bookingList.length === 0) {
                await this.getAllResivedBookings();
                this.bookingReceivedForm.reset();
              }
            }
          },
          (error) => {
            this.alertService.error(error?.error?.message || 'An error occurred while accepting booking.');
          }
        )))
    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'An error occurred while accepting booking.');
    }
  }



  async outForDevilry(booking: any) {
    const payload = {
      booking_id: booking.booking_id,
    }
    try {
      await firstValueFrom(this.BookingresiveService.outDelidery(payload).pipe(
        tap(async (response) => {
          this.alertService.success(response.message);
          this.bookingList = [];
          if (this.bookingList === null || this.bookingList.length === 0) {
            await this.getAllResivedBookings();
            this.bookingReceivedForm.reset();
          }
        },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )))
    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'An error occurred while accepting booking.');
    }
  }




  async forwardOrder(booking: any) {
    const id = booking.booking_id
    if (!id) {
      return;
    }
    const ask = await this.alertService.confirm("You want to forward this order to next branch?");
    if (ask == true) {
      await firstValueFrom(this.BookingresiveService.forward(id).pipe(
        tap(async (response) => {
          this.alertService.success(response.message);
          this.bookingList = [];
              if (this.bookingList === null || this.bookingList.length === 0) {
                await this.getAllResivedBookings();
                this.bookingReceivedForm.reset();
              }
        },
          (error) => {
            this.alertService.error(error.error.message);
          }
        ))
      )
    }
  }



  async onScroll(event: any): Promise<void> {
    const bottom = event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
    if (bottom) {
      await this.getAllResivedBookings();
    }
  }


  toggleAddState() {
    this.showAddState = !this.showAddState;
    this.isEditing = false;
  }


  getCityName(cityId: number): string {
    const cities = this.storage.get('cities') as { city_id: number; city_name: string }[] || [];
    console.log(cities)
    const city = cities.find(city => city.city_id === cityId);
    return city ? city.city_name : 'Unknown City';
  }

}
