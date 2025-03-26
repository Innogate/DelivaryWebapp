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
import { EmployeesService } from '../../../../../services/employees.service';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { GlobalStorageService } from '../../../../../services/global-storage.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  imports: [DropdownModule, SelectModule, AutoCompleteModule, RadioButtonModule, ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, CommonModule, DividerModule, CheckboxModule],
  providers: [MessageService]
})
export class BookingComponent implements OnInit {
  cities: any[] = [];
  branches: any[] = [];
  transportModes: any[] = [];
  bookings: any[] = [];
  // allCities: any[] = [];
  // selectedState: any;
  // searchResults: any[] = [];
  selectedBranch: any;
  selectedTransportMode: any;
  bookingForm: FormGroup;
  filteredCities: any[] = [];
  selectedCity: any = null;
  amount: number = 0;
  branchInfo: any;
  constructor(
    private cityService: CityService,
    private stateService: StateService,
    private branchService: BranchService,
    private bookingService: BookingService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private employeeService: EmployeesService,
    private globalstore: GlobalStorageService
  ) {
    this.bookingForm = this.fb.group({});
  }

  async ngOnInit(): Promise<void> {
    this.createForm();
    this.loadTransportModes();
    this.gateAllBranch();
    this.bookingForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => this.calculateTotal());
    this.gateAllcity();
    this.branchInfo = this.globalstore.get('branchInfo');
    this.onCheckboxChange(false);
  }


  createForm() {
    this.bookingForm = this.fb.group({
      // package section
      slip_no: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // Booking sleep number
      package_count: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], //  package count
      package_weight: ['', [Validators.required,]], // package weight
      package_value: ['',], // package value
      package_contents: ['0'], // package contents

      // booking details
      consignor_name: ['', [Validators.required]], // consignor name
      consignor_mobile: ['', [Validators.pattern('^[0-9]{10}$')]], // consignor mobile number
      consignee_name: ['', [Validators.required]], // consignee name
      consignee_mobile: ['', [Validators.pattern('^[0-9]{10}$')]], // consignee mobile number
      destination_city_id: [null, Validators.required], // destination city
      destination_branch_id: [null, Validators.required], // destination branch
      transport_mode: [''], // transport mode


      // Billing section
      paid_type: "Prepaid", // payment type
      booking_address: ['0'], // booking address
      shipper_charges: [''], // shipper charges
      other_charges: [''], // other charges
      declared_value: [''],
      cgst: ['0'],
      sgst: ['0'],
      igst: ['0'],
      total_value: ['', [Validators.required,]],

      to_pay: ['0'],
      on_account: ['0'],
      amount: [],

      // extra fields
      xp_branch_id: null,
    });
  }

  async gateAllcity() {
    const storedCities = this.globalstore.get<{ city_id: number; city_name: string }[]>('cities');

    if (storedCities) {
      this.cities = storedCities;
      this.filteredCities = [];
      return;
    }
    try {
      await firstValueFrom(
        this.cityService.getAllCities({
          "fields": [],
          "max": 2000,
          "current": 0
        }).pipe(
          tap((res) => {
            this.cities = Array.isArray(res.body) ? res.body : [];
            this.globalstore.set('cities', this.cities, true);
          })
        )
      );
    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'Failed to fetch cities');
      this.cities = [];
    }
    this.filteredCities = [];
  }
  searchCity(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCities = this.cities.filter(city =>
      city.city_name.toLowerCase().includes(query)
    );
  }

  onCitySelect(event: any) {
    console.log('Selected City:', event);  // Debugging
    if (event) {
      console.log('Selected City ID:', event.value.id);
      console.log('Selected City Name:', event.value.name);
    }
  }



  async saveBooking() {
    if (!this.bookingForm.valid) {
      this.alertService.error("Form is invalid. Please fill in all required fields.");
      return;
    }

    let formData = { ...this.bookingForm.value };
    if (formData.destination_city_id && typeof formData.destination_city_id === 'object') {
      formData.destination_city_id = formData.destination_city_id.city_id;
    }

    await firstValueFrom(this.bookingService.addNewBooking(formData).pipe(
      tap(
        async (res) => {
          if (res.body) {
            await this.alertService.success(res.message);
            this.createForm();
          }
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }

  async gateAllBranch() {
    const payload =
    {
      "fields": [],
      "max": 12,
      "current": 0,
    }

    await firstValueFrom(this.branchService.getAllBranches(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.branches = res.body;
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
  book(): void {
    console.log("Not implemented");
  }


  calculateAmount() {
    const weight = Number(this.bookingForm.get('package_weight')?.value) || 0;
    const charges = Number(this.bookingForm.get('package_value')?.value) || 0;
    const amount = weight > 0 && charges > 0 ? +(weight * charges).toFixed(2) : 0;
    this.bookingForm.patchValue({ amount }, { emitEvent: false });
  }

  calculateTotal() {
    // Get the values from the form and convert them to numbers
    const shipper = Number(this.bookingForm.get('shipper_charges')?.value) || 0;
    const other = Number(this.bookingForm.get('other_charges')?.value) || 0;
    const cgst = Number(this.bookingForm.get('cgst')?.value) || 0;
    const sgst = Number(this.bookingForm.get('sgst')?.value) || 0;
    const igst = Number(this.bookingForm.get('igst')?.value) || 0;
    const amount = Number(this.bookingForm.get('amount')?.value) || 0;

    // Subtotal includes Amount + Shipper + Other charges
    const subtotal = +(amount + shipper + other).toFixed(2);

    // Calculate GST amounts
    const cgstAmount = +(subtotal * (cgst / 100)).toFixed(2);
    const sgstAmount = +(subtotal * (sgst / 100)).toFixed(2);
    const igstAmount = +(subtotal * (igst / 100)).toFixed(2);

    // Final total calculation
    let total_value: number;
    if (this.bookingForm.get('to_pay')?.value) {
      // If 'toPay' is true, use IGST
      total_value = +(subtotal + igstAmount).toFixed(2);
    } else {
      // If 'toPay' is false, use CGST and SGST
      total_value = +(subtotal + cgstAmount + sgstAmount).toFixed(2);
    }

    // Update the form control for total_value
    this.bookingForm.patchValue({ total_value }, { emitEvent: false });
  }

  onCheckboxChange(data: any) {
    if (data) {
      this.bookingForm.patchValue({
        cgst: ['0'],
        sgst: ['0'],
        igst: this.branchInfo.igst,
      })
    } else {
      this.bookingForm.patchValue({
        cgst: this.branchInfo.cgst,
        sgst: this.branchInfo.sgst,
        igst: ['0'],
      })
    }
  }


}
