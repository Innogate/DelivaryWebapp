import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { firstValueFrom, tap } from 'rxjs';
import { BranchService } from '../../../../../services/branch.service';
import { TableModule } from 'primeng/table';
import { CityService } from '../../../../../services/city.service';
import { GlobalStorageService } from '../../../../../services/global-storage.service';

@Component({
  selector: 'app-manifest',
  imports: [DropdownModule, SelectModule,TableModule, AutoCompleteModule, RadioButtonModule, ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, CommonModule, DividerModule, CheckboxModule],
  templateUrl: './manifest.component.html',
  styleUrl: './manifest.component.scss'
})
export class ManifestComponent {
  companies: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  branchList: any[] = [];
  showAddState: boolean = false;
  selectedFileName: string = '';
  private touchStartY: number = 0;
  isEditing: boolean = false;
  company_id: number = 1;
  transportModes: any[] = [];
  selectedTransportMode: any;
  filteredCities: any[] = [];
  selectedCity: any = null;
  branches: any[] = []; 
  coLoaderOptions: any[] = [];
  form: FormGroup;

  constructor(private branchService: BranchService, private fb: FormBuilder, private cityService: CityService,private globalstore: GlobalStorageService) { 
    this.form = this.fb.group({
      branch_name: ['', Validators.required],
      destination_city_id: ['', Validators.required],
      co_loader: ['', Validators.required],
      transport_mode: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.gateAllBranch();
    this.loadTransportModes();
    this.gateAllcity();
  }



  async gateAllcity(){
    const storedCities = this.globalstore.get<{ city_id: number; city_name: string }[]>('cities');
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
              this.globalstore.set('cities', this.cities, true);            }
          }
        )
      ))
    } catch (error) {
      console.error('Error fetching cities:', error);
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




  // Filter city suggestions based on user input
  searchCity(event: any) {
    // console.log('Search City:', event.query);
    const query = event?.query?.toLowerCase() || ''; // Ensure query exists
   console.log(query)

  
    this.filteredCities = this.cities.filter(city =>
      city.city_name?.toLowerCase().includes(query) // Ensure city.name exists
    );
    console.log(this.filteredCities)
  }
  

  // Handle city selection
  onCitySelect(event: any) {
    console.log('Selected City:', event);
  }


  loadTransportModes(): void {
    this.transportModes = [
      { label: 'Bus', value: 'B' },
      { label: 'Train', value: 'T' },
      { label: 'Flight', value: 'F' },
      { label: 'Cab', value: 'C' }
    ];
  }




  toggleAddState() {
    this.showAddState = !this.showAddState;
    this.isEditing = false;
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent) {
    const touchEndY = event.changedTouches[0].clientY;
    if (touchEndY - this.touchStartY > 50) {
      this.showAddState = false;
    }
  }
















  bookingList = [
    { number: 'BK-1001', selected: false },
    { number: 'BK-1002', selected: false },
    { number: 'BK-1003', selected: false },
    { number: 'BK-1004', selected: false },
    { number: 'BK-1005', selected: false },
    { number: 'BK-1005', selected: false }

  ];
  filteredBookings = [...this.bookingList]; // Copy of booking list
  searchTerm: string = '';
  selectAll: boolean = false;

  // Toggle Select All
  toggleSelectAll() {
    this.filteredBookings.forEach(booking => booking.selected = this.selectAll);
  }

  // Update Selected Checkboxes
  updateSelected() {
    this.selectAll = this.filteredBookings.every(booking => booking.selected);
  }

  // Search and Filter Bookings
  filterBookings() {
    this.filteredBookings = this.bookingList.filter(booking =>
      booking.number.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Save Selected Bookings
  saveSelectedBookings() {
    const selectedBookings = this.bookingList
      .filter(b => b.selected)
      .map(b => b.number);
      
    console.log('Selected Booking Numbers:', selectedBookings);
  }
}
