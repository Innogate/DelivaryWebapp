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
  coloaderStatus: 'active' | 'inactive' = 'active';
  coloaderId: number = 0;

  constructor(
    private fb: FormBuilder,
    private globalstore: GlobalStorageService,
    private cityService: CityService,
    private coloaderService: coloaderService,
    private alertService: AlertService
  ) {
    this.coloaderForm = this.fb.group({
      coloader_name: ['', Validators.required],
      coloader_contact: [''],
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
      this.alertService.error('Error fetching cities:');
    }
  }


  // Filter city suggestions based on user input
  searchCity(event: any) {
    const query = event?.query?.toLowerCase() || '';


    this.filteredCities = this.cities.filter(city =>
      city.city_name?.toLowerCase().includes(query)
    );
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
    if (this.coloaderForm.valid) {
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
      "fields": [],
      "max": 10000,
      "current": 0
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



  viewcoloader(coloader: any) {
    this.showAddState = true;
    this.coloaderForm.patchValue({
      coloader_name: coloader.coloader_name,
      coloader_contact: coloader.coloader_contuct,
      coloader_address: coloader.coloader_address,
      coloader_postal_code: coloader.coloader_postal_code,
      coloader_email: coloader.coloader_email,
    });
    this.coloaderId = coloader.coloader_id;
    const storedCities = this.globalstore.get<{ city_id: number; city_name: string }[]>('cities');
    const city_update = storedCities?.find((city) => city.city_id == coloader.coloader_city);
    if (city_update) {
      this.coloaderForm.patchValue({ coloader_city: city_update?.city_name });
    }
    this.isEditing = true;
  }



  // Update coloader
  updateColoader() {
    const formData = { ...this.coloaderForm.value };
    const storedCities = this.globalstore.get<{ city_id: number; city_name: string }[]>('cities');
    if (formData.coloader_city) {
      const selectedCity = storedCities?.find(city => city.city_name == formData.coloader_city);
      formData.coloader_city = selectedCity?.city_id;
    }
    if (this.coloaderForm.valid) {
      const payload = {
        updates: formData,
        conditions: "coloader_id=" + this.coloaderId,
      };
      firstValueFrom(this.coloaderService.updateColoader(payload).pipe(
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


  async deletecoloader(coloader: any) {
    const payload = {
      coloader_id: coloader.coloader_id
    }
    await firstValueFrom(this.coloaderService.deleteColoader(payload).pipe(
      tap((response) => {
        this.alertService.success(response.message);
        this.gateAllColoaders();
      },
        (error) => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }

  setUserStatus(status: 'active' | 'inactive') {
    this.coloaderStatus = status;
    if (status === 'active') {
      this.gateAllColoaders();
    } else if (status === 'inactive') {

    }
  }



  activecoloader(event: any) {
    console.log(event);
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

  // Assuming you have an array of coloaders
  toggleShowMore(coloader: any): void {
    coloader.showMore = !coloader.showMore;
  }

}
