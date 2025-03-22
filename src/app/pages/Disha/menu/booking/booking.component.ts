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

      consignee_id: [],
      consignor_id: [],
      consignor_name: ['', [Validators.required]],
      consignor_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      consignee_name: ['', [Validators.required]],
      consignee_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      destination_city_id: [null, Validators.required],
      destination_branch_id: [null, Validators.required],
      transport_mode: [''],
      count: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      weight: ['', [Validators.required,]],
      value: ['',],
      paid_type: "Prepaid",
      contents: ['0'],
      address: ['0'],
      charges: ['', [Validators.required,]],
      shipper: ['',],
      other: ['',],
      cgst: ['', [Validators.required,]],
      sgst: ['', [Validators.required,]],
      igst: ['', [Validators.required,]],
      total: ['', [Validators.required,]],
      account: [],
      amount: []
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
    const storedCities = this.globalstore.get<{ id: number; name: string }[]>('cities');

    if (storedCities) {
      this.cities = storedCities;
      this.filteredCities = [];
      return;
    }

    try {
      await firstValueFrom(
        this.cityService.getAllCities({
          fields: ["cities.id", "cities.name"],
          max: 9000,
          current: 0,
          relation: null
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
              label: branch.name,
              value: branch.id
            }));
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
