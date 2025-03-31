import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ThemeService } from '@primeng/themes';
import { firstValueFrom, tap } from 'rxjs';
import { GlobalStorageService } from '../../../../../../services/global-storage.service';
import { CityService } from '../../../../../../services/city.service';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { coloaderService } from '../../../../../../services/coloader.service';
import { AlertService } from '../../../../../../services/alert.service';

@Component({
  selector: 'app-co-loader',
  imports: [DropdownModule, SelectModule, TableModule, AutoCompleteModule, RadioButtonModule, ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, CommonModule, DividerModule, CheckboxModule],
  templateUrl: './co-loader.component.html',
  styleUrl: './co-loader.component.scss'
})
export class CoLoaderComponent {
  companies: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  branchList: any[] = [];
  showAddState: boolean = false;
  selectedFileName: string = '';
  private touchStartY: number = 0;
  isEditing: boolean = false;
  company_id: number = 1;
  coloaderForm: FormGroup;
  filteredCities: any[] = [];
  selectedCity: any = null;
  coloaderList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private globalstore: GlobalStorageService,
    private cityService: CityService,
    private coloaderService: coloaderService,
    private alertService: AlertService
  ) {
    this.coloaderForm = this.fb.group({
      coloader_name: ['', Validators.required],
      coloader_contuct: [''],
      coloader_address: [''],
      coloader_postal_code: [''],
      coloader_email: [''],
      coloader_city: ['']
    })
  }

  ngOnInit(): void {
    this.globalstore.set('PAGE_TITLE', "CO-LOADER");
    this.gateAllcity();
    this.gateAllColoaders();
  }




  async gateAllcity() {
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
              this.globalstore.set('cities', this.cities, true);
            }
          }
        )
      ))
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  }


  // Filter city suggestions based on user input
  searchCity(event: any) {
    const query = event?.query?.toLowerCase() || ''; 
    console.log(query)


    this.filteredCities = this.cities.filter(city =>
      city.city_name?.toLowerCase().includes(query) 
    );
    console.log(this.filteredCities)
  }


  // Handle city selection
  onCitySelect(event: any) {
    console.log('Selected City:', event);
  }


  // Add new coloader
  async addColoader() {
    let formData = { ...this.coloaderForm.value };
      if (formData.coloader_city && typeof formData.coloader_city === 'object') {
      formData.coloader_city = formData.coloader_city.city_id;
    }
    if( this.coloaderForm.valid){
      console.log("clearing coloader");
      await firstValueFrom(this.coloaderService.addNewColoader(formData).pipe(
        tap((response) => {
            this.alertService.success(response.message);
            this.coloaderForm.reset();
            this.gateAllColoaders();
        },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      ))
    }
  }


  // gate all coloaders
  async gateAllColoaders() {
    const payload = {
      "fields" : [],
      "max" : 12,
      "current" : 0
    }
    await firstValueFrom(this.coloaderService.fetchColoader(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.coloaderList = res.body;
          }
        },
        (error) => {
          this.alertService.error(error.error.message);
        }
      )
    ))
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
}
