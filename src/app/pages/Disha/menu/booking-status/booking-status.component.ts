import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { BookingService } from '../../../../../services/booking.service';
import { AlertService } from '../../../../../services/alert.service';
import { StateService } from '../../../../../services/state.service';
import { CityService } from '../../../../../services/city.service';
import { BranchService } from '../../../../../services/branch.service';
import { GlobalStorageService } from '../../../../../services/global-storage.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-booking-status',
  standalone: true,
  imports: [CommonModule, AutoCompleteModule, DropdownModule, CalendarModule, FormsModule, ReactiveFormsModule, DatePickerModule],
  templateUrl: './booking-status.component.html',
  styleUrls: ['./booking-status.component.scss']
})
export class BookingStatusComponent implements OnInit {

  bookingList?: any[];
  filteredBookingsInventory?: any[];
  current = 0;
  max = 10;
  bookingStatusForm: FormGroup;
  branches: any[] = [];
  cities: any[] = [];
  filteredCities: any[] = [];
  selectedCity: any;

  constructor(
    private bookService: BookingService,
    private alertService: AlertService,
    private branchService: BranchService,
    private storage: GlobalStorageService,
    private fb: FormBuilder,
    private globalStorage: GlobalStorageService,
    private cityService: CityService,
  ) {
    this.bookingStatusForm = this.fb.group({
      bookingDate: [''],
      destination_city_id: [''],
      destination_id: ['']
    })

  }

  async ngOnInit() {
    this.storage.set('PAGE_TITLE', "BOOKING LIST");
    await this.getAllBooking();
    this.gateAllBranch();
    this.gateAllcity();
    this.filterBookingList()
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
              this.filterBookingList();
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



  async gateAllBranch() {
    const payload =
    {
      "fields": [],
      "max": 5000,
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


  async gateAllcity() {
    const storedCities = this.globalStorage.get<{ city_id: number; city_name: string }[]>('cities');
    if (storedCities) {
      this.cities = storedCities;
      this.filteredCities = [];
      return;
    }

    try {
      await firstValueFrom(this.cityService.getAllCities({
        "fields": ["city_id", "city_name"],
        "max": 5000,
        "current": 0,
      }).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.cities = res.body;
              this.globalStorage.set('cities', this.cities, true);
            }
          }
        )
      ))
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  }

  onCitySelect(event: any) {
    if (event.value) {
      console.log(event.value);
      this.bookingStatusForm?.patchValue({ destination_city_id: event.value.city_id });
      this.selectedCity = event.value;
      if (event.value.destination_city_id == '', event.value.destination_city_id == undefined) {
        this.filterBookingList();

      }
    }

    this.filterBookingList();
  }

  searchCity(event: any) {
    const query = event?.query?.toLowerCase() || '';
    console.log(query)
    this.filterBookingList();

    this.filteredCities = this.cities.filter(city =>
      city.city_name?.toLowerCase().includes(query)
    );
  }

  getCityName(cityId: number): string {
    const cities = this.storage.get('cities') as { city_id: number; city_name: string }[] || [];
    const city = cities.find(city => city.city_id === cityId);
    return city ? city.city_name : ''; // Return city name or empty string if not found
  }

  onCityInputChange(value: any) {
    if (!value || typeof value === 'string') {
      this.bookingStatusForm.patchValue({ destination_city_id: null });
    }
    this.filterBookingList();
  }


  filterBookingList() {
    const { bookingDate, destination_city_id, destination_id } = this.bookingStatusForm.value;
    console.log('Filter values:', { bookingDate, destination_city_id, destination_id });

    const selectedDate = bookingDate
      ? new Date(bookingDate).toLocaleDateString('en-CA')
      : null;

    this.filteredBookingsInventory = this.bookingList?.filter(booking => {
      const bookingCreatedDate = new Date(booking.created_at).toLocaleDateString('en-CA');

      return (
        (selectedDate ? bookingCreatedDate === selectedDate : true) &&
        (destination_city_id ? booking.destination_city_id === +destination_city_id : true) &&
        (destination_id ? booking.destination_branch_id === +destination_id : true)
      );
    });
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
