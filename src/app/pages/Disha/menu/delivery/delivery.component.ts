import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { firstValueFrom, tap } from 'rxjs';
import { GlobalStorageService } from '../../../../../services/global-storage.service';
import { CityService } from '../../../../../services/city.service';
import { EmployeesService } from '../../../../../services/employees.service';
import { AlertService } from '../../../../../services/alert.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { deliveryService } from '../../../../../services/delivery.service';

@Component({
  selector: 'app-delivery',
  imports: [DropdownModule, CommonModule, AutoCompleteModule, FormsModule, TagModule, ButtonModule, ReactiveFormsModule],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.scss'
})
export class DeliveryComponent {
  filteredCities: any[] = [];
  cities: any[] = [];
  deliveryForm: FormGroup;
  selectedCity: any = null;
  EmployeeList: any[] = [];
  selectedBookingsInventory: any[] = [];
  filteredBookingsInventory: any[] = [];
  bookingsInventory: any[] = [];


  constructor(private fb: FormBuilder, private globalstorageService: GlobalStorageService,
    private cityService: CityService, private EmployeeService: EmployeesService, private alertService: AlertService,
    private deliveryService: deliveryService,) {
    this.deliveryForm = this.fb.group({
      city_id: [],
      employee_id: [''],
    });
  }


  async ngOnInit(): Promise<void> {
    this.globalstorageService.set('PAGE_TITLE', "DELIVERY");
    this.gateAllcity();
    this.gateAllEmployee();
    await this.getAllBookings();
    this.filterDelivery();
  }



  async gateAllcity() {
    const storedCities = this.globalstorageService.get<{ city_id: number; city_name: string }[]>('cities');
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
              this.globalstorageService.set('cities', this.cities, true);
            }
          }
        )
      ))
    } catch (error) {
      this.alertService.error('' + error);
    }
  }

  async gateAllEmployee() {
    const payload: any = {
      fields: [],
      max: 10,
      current: 0
    }
    try {
      await firstValueFrom(this.EmployeeService.getAllEmployees(payload).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.EmployeeList = res.body;
            }
          }
        )
      ))
    } catch (error) {
      this.alertService.error('' + error);
    }
  }





  async getAllBookings() {

    try {
      await firstValueFrom(this.deliveryService.fetchDelivery().pipe(
        tap((res: any) => {
          if (res?.body) {
            this.bookingsInventory = res.body;
          }
        })
      ));
    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'An error occurred while fetching bookings.');
    }
  }



  async addNewDelivery() {
    if (this.selectedBookingsInventory.length === 0) {
      this.alertService.error('Please select booking');
      return;
    }

    const selectedBookingIds = this.selectedBookingsInventory.map(booking => booking.booking_id);

    try {
      const payload = {
        employee_id: this.deliveryForm.value.employee_id,
        booking_lists: selectedBookingIds
      }
      await firstValueFrom(this.deliveryService.addNewDelivery(payload).pipe(
        tap(
          async (res) => {
            if (res) {
             await this.alertService.success(res.message);
              this.getAllBookings();
            }
          },
          (error) => {
            this.alertService.error(error?.error?.message || 'An error occurred while adding delivery.');
          }
        )
      ))
    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'An error occurred while adding delivery.');
    }
  }



  // felterBookings() {
  //   if (this.deliveryForm.value.city_id) {
  //     this.filteredBookingsInventory = this.bookingsInventory.filter(booking => booking.city_id === this.selectedCity.city_id);
  //   } else {
  //     this.filteredBookingsInventory = this.bookingsInventory;
  //   }
  // }


  filterDelivery() {
    const { city_id } = this.deliveryForm.value;
  
    if (!city_id || city_id === '') {
      this.filteredBookingsInventory = [...this.bookingsInventory];
      return;
    }
  
    this.filteredBookingsInventory = this.bookingsInventory.filter(item => item.destination_city_id === city_id);
  }
  





  selectBooking(booking: any) {
    this.selectedBookingsInventory.push(booking);
    this.filteredBookingsInventory.splice(this.filteredBookingsInventory.indexOf(booking), 1);
    this.bookingsInventory.splice(this.bookingsInventory.indexOf(booking), 1);
  }

  removeBooking(booking: any) {
    this.filteredBookingsInventory.push(booking);
    this.bookingsInventory.push(booking);
    this.selectedBookingsInventory.splice(this.selectedBookingsInventory.indexOf(booking), 1);
  }


  selectAllBookings() {
    this.selectedBookingsInventory = this.filteredBookingsInventory;
    // remover all item from bookingsInventory
    this.bookingsInventory = this.bookingsInventory.filter(booking => !this.filteredBookingsInventory.includes(booking));
    this.filteredBookingsInventory = [];
  }

  deselectAllBookings() {
    this.filteredBookingsInventory = this.selectedBookingsInventory;
    // add all item from bookingsInventory
    this.bookingsInventory = this.bookingsInventory.concat(this.selectedBookingsInventory);
    this.selectedBookingsInventory = [];
  }


  onCitySelect(event: any) {
    this.deliveryForm?.patchValue({ city_id: event.value.city_id });
    this.selectedCity = event.value;
}


  searchCity(event: any) {
    const query = event?.query?.toLowerCase() || '';
    (query)


    this.filteredCities = this.cities.filter(city =>
      city.city_name?.toLowerCase().includes(query)
    );
  }
}
