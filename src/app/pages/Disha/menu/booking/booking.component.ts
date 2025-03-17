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

      slip_no: ['', [Validators.required]],
      consignor_name: ['', [Validators.required]],
      consignor_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      consignee_name: ['', [Validators.required]],
      consignee_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      destination_city_id: [null, Validators.required],
      destination_branch_id: [null, Validators.required],
      transport_mode: [null, Validators.required],
      count: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      weight: ['', [Validators.required,]],
      value: ['',],
      paid_type: "Prepaid",
      contents: [''],
      charges: ['', [Validators.required,]],
      shipper: ['',],
      other: ['',],
      cgst: ['', [Validators.required,]],
      sgst: ['', [Validators.required,]],
      igst: ['', [Validators.required,]],
      total: ['', [Validators.required,]]

    });

  }

  ngOnInit(): void {
    this.loadStates();
    this.loadTransportModes();
    this.loadBookings();
    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
  }

  async loadStates() {
    await firstValueFrom(this.stateService.getAllStates({
      fields : ["states.id","states.name"],
      max : 12,
      current : 0,
      relation : null
    }).pipe(
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
      await firstValueFrom(this.cityService.getCitiesByStateId({
        "fields" : ["cities.id","cities.name"],
        "max" : 12,
        "current" : 0,
        "relation" : null,
        "state_id": $event
      }).pipe(
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
      await firstValueFrom(this.branchService.getBranchesByCityId($event).pipe(
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
    this.bookingService.getBookingList(
      {
        max: 10,
        current: 0
      }
    ).subscribe(response => {
      this.bookings = response.data || [];
    });
  }

  book(): void {
    console.log("Not implemented");
  }

  // deleteBooking(bookingId: number): void {
  //   this.bookingService.deleteBooking(bookingId).subscribe(response => {
  //     if (response.success) {
  //       this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Booking deleted successfully' });
  //       this.loadBookings();
  //     } else {
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete booking' });
  //     }
  //   });
  // }


  async saveBooking() {
    if (this.bookingForm.valid) {
      await firstValueFrom(this.bookingService.addNewBooking(this.bookingForm.value).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.alertService.success(res.message);
              this.bookingForm.reset();
              this.loadBookings();
            }
          },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      ))
    }
  }

  calculateTotal() {
    const charges = Number(this.bookingForm.get('charges')?.value) || 0;
    const shipper = Number(this.bookingForm.get('shipper')?.value) || 0;
    const other = Number(this.bookingForm.get('other')?.value) || 0;
    const cgst = Number(this.bookingForm.get('cgst')?.value) || 0;
    const sgst = Number(this.bookingForm.get('sgst')?.value) || 0;
    const igst = Number(this.bookingForm.get('igst')?.value) || 0;

    const subtotal = charges + shipper + other;
    const cgstAmount = (cgst / 100) * subtotal;
    const sgstAmount = (sgst / 100) * subtotal;
    const igstAmount = (igst / 100) * subtotal;

    const total = subtotal + cgstAmount + sgstAmount + igstAmount;

    this.bookingForm.patchValue({ total: total.toFixed(2) });
  }

}
