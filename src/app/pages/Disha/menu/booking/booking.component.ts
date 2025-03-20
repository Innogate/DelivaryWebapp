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
import { debounceTime, firstValueFrom, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../services/alert.service';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  imports: [DropdownModule, SelectModule, ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, CommonModule],
  providers: [MessageService]
})
export class BookingComponent implements OnInit {
  states: any[] = [];
  cities: [] = [];
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

      consignee_id: [],
      consignor_id: [],
      consignor_name: ['', [Validators.required]],
      consignor_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      consignee_name: ['', [Validators.required]],
      consignee_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      destination_city_id: [null, Validators.required],
      destination_branch_id: [null, Validators.required],
      transport_mode: ['A'],
      count: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      weight: ['', [Validators.required,]],
      value: ['',],
      paid_type: "Prepaid",
      contents: [''],
      address: ['0'],
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
    this.gateAllBranch();
    this.bookingForm.valueChanges
      .pipe(debounceTime(300)) // ✅ Prevents too frequent calls
      .subscribe(() => this.calculateTotal());
  }

  async loadStates() {
    await firstValueFrom(this.stateService.getAllStates({
      fields: ["states.id", "states.name"],
      max: 50,
      current: 0,
      relation: null
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

  // gate Consignee
  async gateConsignee() {
    const payload = {
      "mobile": this.bookingForm.get('consignee_mobile')?.value
    }
    await firstValueFrom(this.bookingService.GetConsigneebyMobileNumber(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.bookingForm.patchValue({
              consignee_name: res.body.consignee_name,
              consignee_id: res.body.id,
            });
          }
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }

  // gate Consignor
  async gateConsignor() {
    const payload = {
      "mobile": this.bookingForm.get('consignor_mobile')?.value
    }
    await firstValueFrom(this.bookingService.GetConsignorbyMobileNumber(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.bookingForm.patchValue({
              consignor_name: res.body.consignor_name,
              consignor_id: res.body.id,
            });
          }
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }

  // Create Consignee
  async createConsignee() {
    const payload = {
      "consignee_name": this.bookingForm.get('consignee_name')?.value,
      "consignee_mobile": this.bookingForm.get('consignee_mobile')?.value
    }
    console.log(payload);
    await firstValueFrom(this.bookingService.CreateConsignee(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.bookingForm.patchValue({
              consignee_id: res.body.consignee_id,
            });
          }
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }


  // Create Consignor
  async createConsignor() {
    const payload = {
      "consignor_name": this.bookingForm.get('consignor_name')?.value,
      "consignor_mobile": this.bookingForm.get('consignor_mobile')?.value
    }
    console.log(payload);
    await firstValueFrom(this.bookingService.CreateConsignor(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.bookingForm.patchValue({
              consignor_id: res.body.id,
            });
          }
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }


  async saveBooking() {
    if (!this.bookingForm.valid) {
      this.alertService.error("Form is invalid. Please fill in all required fields.");
      return;
    }
  
    try {
      if (!this.bookingForm.get('consignor_id')?.value) {
        await this.createConsignor();
      }
      if (!this.bookingForm.get('consignee_id')?.value) {
        await this.createConsignee();
      }
  
      const res = await firstValueFrom(this.bookingService.addNewBooking(this.bookingForm.value));
  
      if (res.body) {
        this.alertService.success(res.message);
        this.bookingForm.reset();
        await this.loadBookings();
      }
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || "An error occurred while saving booking.";
      this.alertService.error(errorMessage);
      console.error("Booking Save Error:", error);
    }
  }

  async onStateChange($event: any) {
    if ($event) {
      await firstValueFrom(this.cityService.getCitiesByStateId({
        "fields": ["cities.id", "cities.name"],
        "max": 100,
        "current": 0,
        "relation": null,
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

  async gateAllBranch() {
    const payload =
    {
      fields: ["branches.id", "branches.name"],
      max: 12,
      current: 0,
      relation: null
    }

    await firstValueFrom(this.branchService.getAllBranches(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.branches = res.body.map((branch: any) => ({
              label: branch.name,   // Adjust according to actual API response field
              value: branch.id      // Adjust according to actual API response field
            }));
          }
        }
      )
    ))
  }

  loadTransportModes(): void {
    this.transportModes = [
      { label: 'Bus', value: 'B' },
      { label: 'Train', value: 'T' },
      { label: 'Flight', value: 'F' },
      { label: 'Cab', value: 'C' }
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
