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
    this.bookingForm = this.fb.group({
        // package section
        slip_no: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // Booking sleep number
        package_count: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], //  package count
        package_weight: ['', [Validators.required,]], // package weight
        package_value: ['',], // package value
        package_contents: ['0'], // package contents

        // booking details
        consignor_name: ['', [Validators.required]], // consignor name
        consignor_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // consignor mobile number
        consignee_name: ['', [Validators.required]], // consignee name
        consignee_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // consignee mobile number
        destination_city_id: [null, Validators.required], // destination city
        destination_branch_id: [null, Validators.required], // destination branch
        transport_mode: [''], // transport mode


        // Billing section
        paid_type: "Prepaid", // payment type
        booking_address: ['0'], // booking address
        shipper_charges: ['',], // shipper charges
        other_charges: ['',], // other charges
        declared_value: ['', [Validators.required,]],
        cgst: ['', [Validators.required,]],
        sgst: ['', [Validators.required,]],
        igst: ['', [Validators.required,]],
        total_value: ['', [Validators.required,]],

        to_pay: [''],
        on_account: [],
        amount: [],

        // extra fields
        xp_branch_id: null,
    });

  }

  async ngOnInit(): Promise<void> {
    this.loadTransportModes();
    this.gateAllBranch();
    this.gateEmployeeInfo();
    this.bookingForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => this.calculateTotal());
    this.gateAllcity();
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
      city.name.toLowerCase().includes(query)
    );
  }

  onCitySelect(event: any) {
    console.log('Selected City:', event);  // Debugging
    if (event) {
      console.log('Selected City ID:', event.value.id);
      console.log('Selected City Name:', event.value.name);
    }
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
        // error => {
        //   this.alertService.error(error.error.message);
        // }
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
        // error => {
        //   this.alertService.error(error.error.message);
        // }
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
              consignor_id: res.body.consignor_id,
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
      }
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || "An error occurred while saving booking.";
      this.alertService.error(errorMessage);
      console.error("Booking Save Error:", error);
    }
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


  async gateEmployeeInfo() {
    await firstValueFrom(this.employeeService.employeeInfo().pipe(
      tap(
        (res) => {
          if (res.body) {
            this.getBranchInfo(res.body.branch_id);
          }
        }
      )
    ))
  }


  async getBranchInfo(branchId: any) {
    const payload =
    {
      fields: ["branches.*"],
      relation: null,
      branch_id: branchId
    }
    await firstValueFrom(this.branchService.getBranchById(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            console.log(res.body);
            this.bookingForm.patchValue({
              cgst: res.body.cgst,
              sgst: res.body.sgst,
              igst: res.body.igst,
            })
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

  calculateTotal() {
    const weight = Number(this.bookingForm.get('weight')?.value) || 0;
    const charges = Number(this.bookingForm.get('charges')?.value) || 0;
    const shipper = Number(this.bookingForm.get('shipper')?.value) || 0;
    const other = Number(this.bookingForm.get('other')?.value) || 0;
    const cgst = Number(this.bookingForm.get('cgst')?.value) || 0;
    const sgst = Number(this.bookingForm.get('sgst')?.value) || 0;
    const igst = Number(this.bookingForm.get('igst')?.value) || 0;

    // Ensure proper decimal multiplication
    const amount = weight > 0 && charges > 0 ? +(weight * charges).toFixed(2) : 0;
    this.bookingForm.patchValue({ amount }, { emitEvent: false });

    // Subtotal includes Amount + Shipper + Other charges
    const subtotal = +(amount + shipper + other).toFixed(2);

    // Calculate GST amounts
    const cgstAmount = +(subtotal * (cgst / 100)).toFixed(2);
    const sgstAmount = +(subtotal * (sgst / 100)).toFixed(2);
    const igstAmount = +(subtotal * (igst / 100)).toFixed(2);

    // Final total
    const total = +(subtotal + cgstAmount + sgstAmount + igstAmount).toFixed(2);

    this.bookingForm.patchValue({ total }, { emitEvent: false });
  }

}
