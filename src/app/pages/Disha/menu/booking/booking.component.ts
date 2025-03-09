import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityService } from '../../../../../services/city.service';
import { StateService } from '../../../../../services/state.service';
import { BranchService } from '../../../../../services/branch.service';
import { BookingService } from '../../../../../services/booking.service';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { firstValueFrom, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../services/alert.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  imports: [DropdownModule, ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, CommonModule],
  providers: [MessageService]
})
export class BookingComponent implements OnInit {
  states: any[] = [];
  cities: any[] = [];
  branches: any[] = [];
  transportModes: any[] = [];
  bookings: any[] = [];

  selectedState: any;
  selectedCity: any;
  selectedBranch: any;
  selectedTransportMode: any;
  bookingForm: FormGroup;
  constructor(
    private cityService: CityService,
    private stateService: StateService,
    private branchService: BranchService,
    private bookingService: BookingService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.bookingForm = this.fb.group({
      slip_no: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      consignor_name: ['', [Validators.required, Validators.pattern("^[a-zA-Z ]*$")]],
      consignor_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      consignee_name: ['', Validators.required, Validators.pattern("^[a-zA-Z ]*$")],
      consignee_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      destination_city_id: [null, Validators.required],
      destination_branch_id: [null, Validators.required],
      transport_mode: [null, Validators.required],
      count: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      weight: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]+)?$')]],
      value: ['', Validators.pattern('^[0-9]+$')],
      contents: [''],
      charges: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]+)?$')]],
      shipper: ['', Validators.pattern('^[0-9]+(.[0-9]+)?$')],
      other: ['', Validators.pattern('^[0-9]+(.[0-9]+)?$')],
      cgst: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]+)?$')]],
      sgst: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]+)?$')]],
      igst: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]+)?$')]],
      total: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]+)?$')]],
    });

  }

  ngOnInit(): void {
    this.loadStates();
    this.loadTransportModes();
    this.loadBookings();
  }

  async loadStates() {
    await firstValueFrom(this.stateService.getAllStates(0).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.states = res.body;
          }
        }
      )
    ));
  }

  async onStateChange($event: any) {
    if ($event) {
      await firstValueFrom(this.cityService.getCitiesByStateId($event).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.cities = res.body;
            }
          }
        )
      ))
    } else {
      this.cities = [];
      this.branches = [];
    }
  }

  async onCityChange($event: any) {
    if ($event) {
      await firstValueFrom(this.branchService.getBranchesByCityId($event, 0).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.branches = res.body;
            }
          }
        )
      ))
    } else {
      this.branches = [];
    }
  }

  loadTransportModes(): void {
    this.transportModes = [
      { label: 'Bus', value: 'bus' },
      { label: 'Train', value: 'train' },
      { label: 'Flight', value: 'flight' },
      { label: 'Cab', value: 'cab' }
    ];
  }

  loadBookings(): void {
    this.bookingService.getBookingList().subscribe(response => {
      this.bookings = response.data || [];
    });
  }

  book(): void {
    console.log("Not implemented");
  }

  deleteBooking(bookingId: number): void {
    this.bookingService.deleteBooking(bookingId).subscribe(response => {
      if (response.success) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Booking deleted successfully' });
        this.loadBookings();
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete booking' });
      }
    });
  }


  async saveBooking() {
    try {
      if (this.bookingForm.valid) {
        const booking = this.bookingForm.value;
        const response = await this.bookingService.addNewBooking(booking).toPromise();

        if (response.success) {
          this.alertService.success(response.message);
          this.bookingForm.reset();
          this.bookingForm.markAsUntouched();
        } else {
          this.alertService.error(response.message);
        }
      } else {
        this.alertService.error('Please fill out all required fields correctly.');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      this.alertService.error('Something went wrong. Please try again later.');
    }
  }

}
