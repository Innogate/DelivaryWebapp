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
  bookingForm: FormGroup = new FormGroup({});
  filteredCities: any[] = [];
  selectedCity: any = null;
  amount: number = 0;
  branchInfo: any;

  listOfConnersAndConsignees: any[] = [];

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
    this.createForm();
  }

  async ngOnInit(): Promise<void> {
    this.createForm();
    if (!this.bookingForm) {
      return;
    }
    this.globalstore.set('PAGE_TITLE', "BOOKING");
    this.createForm();
    this.loadTransportModes();
    this.gateAllBranch();
    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
    setTimeout(() => {
      if (!this.bookingForm) {
        return;
      }
      this.bookingForm.patchValue({ to_pay: false }, { emitEvent: false });
      this.calculateTotal();
    }, 0);
    this.gateAllcity();
    this.branchInfo = this.globalstore.get('branchInfo');
    // this.onCheckboxChange(false);
  }


  createForm() {
    this.branchInfo = this.globalstore.get('branchInfo');
    //  set default values
    const cgst = this.branchInfo.cgst ?? 0;
    const sgst = this.branchInfo.sgst ?? 0;
    const igst = this.branchInfo.igst ?? 0;

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
      booking_address: ['UNSET'], // booking address
      shipper_charges: [0], // shipper charges
      other_charges: [0], // other charges
      declared_value: [0],
      cgst: [cgst],
      sgst: [sgst],
      igst: [igst],
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
    if (!this.bookingForm) {
      return;
    }
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
    if (!this.bookingForm) {
      return;
    }
    const weight = Number(this.bookingForm.get('package_weight')?.value) || 0;
    const charges = Number(this.bookingForm.get('package_value')?.value) || 0;
    const amount = weight > 0 && charges > 0 ? +(weight * charges).toFixed(2) : 0;

    this.bookingForm.patchValue({ total_value: amount, amount }, { emitEvent: false });
  }

  calculateTotal() {
    if (!this.bookingForm) {
      return;
    }
    const formValues = this.bookingForm.value;
    const shipper = Number(formValues.shipper_charges) || 0;
    const other = Number(formValues.other_charges) || 0;
    const cgst = Number(formValues.cgst) || 0;
    const sgst = Number(formValues.sgst) || 0;
    const igst = Number(formValues.igst) || 0;
    const amount = Number(formValues.amount) || 0;
    const subtotal = +(amount + shipper + other).toFixed(2);
    let gstAmount = 0;
    if (formValues.to_pay) {
      gstAmount = +(subtotal * (igst / 100)).toFixed(2);
    } else {
      const cgstAmount = +(subtotal * (cgst / 100)).toFixed(2);
      const sgstAmount = +(subtotal * (sgst / 100)).toFixed(2);
      gstAmount = +(cgstAmount + sgstAmount).toFixed(2);
    }

    const total_value = +(subtotal + gstAmount).toFixed(2);

    this.bookingForm.patchValue({ total_value }, { emitEvent: false });
  }

  async search($event: any) {
    const string = $event.query;
    await firstValueFrom(this.bookingService.searchConsignee(string).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.listOfConnersAndConsignees = res.body;
          }
        }
      )
    ))
  }

  upperCase(event: any) {
    event.target.value = event.target.value.toUpperCase();
  }

  onConsigneeSelect(event: any) {
    if (!this.bookingForm) {
      return;
    }
    this.bookingForm.patchValue(
      { 
        consignee_name: event.value.consignee_name, 
        consignee_mobile: event.value.consignee_mobile,
        destination_branch_id: event.value.destination_branch_id
      })

      // patch destination city id
      const destinationCity = this.cities.find(city => city.city_id === event.value.destination_city_id);
      if (destinationCity) {
        this.bookingForm.patchValue({ destination_city_id: destinationCity });
      }
  }

  onConsignorSelect(event: any) {
    if (!this.bookingForm) {
      return;
    }
    this.bookingForm.patchValue({
      consignor_name: event.value.consignor_name,
      consignor_mobile: event.value.consignor_mobile,
      consignee_name: event.value.consignee_name, 
      consignee_mobile: event.value.consignee_mobile,
      destination_branch_id: event.value.destination_branch_id
    });
    // patch destination city id
    const destinationCity = this.cities.find(city => city.city_id === event.value.destination_city_id);
    if (destinationCity) {
      this.bookingForm.patchValue({ destination_city_id: destinationCity });
    }
  }
}
