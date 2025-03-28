import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BranchService } from '../../../../../../services/branch.service';
import { CompanyService } from '../../../../../../services/company.service';
import { StateService } from '../../../../../../services/state.service';
import { CityService } from '../../../../../../services/city.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { catchError, firstValueFrom, tap } from 'rxjs';
import { AlertService } from '../../../../../../services/alert.service';
import { payload } from '../../../../../../../interfaces/payload.interface';
import { Password } from 'primeng/password';
import { Router } from '@angular/router';
import { UserService } from '../../../../../../services/user.service';
import { GlobalStorageService } from '../../../../../../services/global-storage.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    FileUploadModule,
    CardModule,
    AutoCompleteModule
  ]
})
export class BranchComponent {
  branchForm: FormGroup;
  companies: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  user: any[] = [];
  branchList: any[] = [];
  showAddState: boolean = false;
  selectedFileName: string = '';
  private touchStartY: number = 0;
  isEditing: boolean = false;
  company_id: number = 1;
  filteredCities: any[] = [];
  selectedCity: any = null;

  // update requre
  city_update: any = {};

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private companyService: CompanyService,
    private stateService: StateService,
    private cityService: CityService,
    private alertService: AlertService,
    private router: Router,
    private userService: UserService,
    private globalstore: GlobalStorageService
  ) {
    this.branchForm = this.fb.group({
      branch_id: [],
      branch_name: ['', [Validators.required, Validators.minLength(3)]],
      branch_short_name: [''],
      alias_name: ['', [Validators.minLength(3)]],
      representative_id: ['', Validators.required],  // ! add it
      address: ['', [Validators.minLength(3)]],
      city_id: [null, [Validators.required, Validators.min(1)]],
      state_id: [null, [Validators.required, Validators.min(1)]],
      pin_code: ['', [Validators.pattern(/^[0-9]{6}$/)]],
      contact_no: [''],
      email: ['', [Validators.email]],
      gst_no: [''],
      cin_no: [''],
      udyam_no: [''],
      cgst: [0],
      sgst: [0],
      igst: [0],
      logo: [0],
      manifest_sires: [''] // ! add it
    });

    this.fetchBranches();
    this.loadStates();
    this.gateAllcity();
    this.gateAllUser();
  }

  async fetchBranches() {
    try {
      const payload = {
        fields: [],
        max: 100,
        current: 0
      };
      const res = await firstValueFrom(this.branchService.getAllBranches(payload));
      if (res.body) {
        this.branchList = res.body;
      }
    } catch (error: any) {
      this.alertService.error(error.error?.message || 'Failed to fetch branches.');
    }
  }


  async gateAllUser() {
    const payload = {
      "fields": [],
      "max": 10,
      "current": 0
    }

    await firstValueFrom(this.userService.getAllUsers(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.user = res.body.map((branch: any) => ({
                ...branch,
                fullName: `${branch.first_name} ${branch.last_name}`
              }));
          }
        },
        (error) => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }




  async loadStates() {
    await firstValueFrom(
      this.stateService.getAllStates({
        fields: [],
        max: 50,
        current: 0,
      }).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.states = res.body;
            }
          }
        )
      )
    )
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


  searchCity(event: any) {
    const query = event?.query?.toLowerCase() || ''; 
    console.log(query)


    this.filteredCities = this.cities.filter(city =>
      city.city_name?.toLowerCase().includes(query) 
    );
    console.log(this.filteredCities)
  }


  onCitySelect(event: any) {
    console.log('Selected City:', event);
  }





  async deleteBranch(branch: any) {
    if (branch) {
      const confirmation = this.alertService.confirm("You want to delete this state ? ");
      if (await confirmation === false) {
        return;
      } else {
        await firstValueFrom(this.branchService.deleteBranch(branch.branch_id).pipe(
          tap((response) => {
            this.alertService.success(response.message);
            this.fetchBranches();
          },
            (error) => {
              this.alertService.error(error.error.message);
            }
          ))
        )
      }
    }
  }

  viewBranch(branch: any) {
    console.log(branch);
    this.isEditing = true;
    if (branch) {
      this.showAddState = true;
      this.branchForm.patchValue(branch);
      // pach city name \
      const storedCities = this.globalstore.get<{ city_id: number; city_name: string }[]>('cities');
      this.city_update=  storedCities?.find((city) => city.city_id === branch.city_id);
      this.branchForm.patchValue({ city_id: this.city_update.city_name });
    }
  }

  async updateBranch() {
    if (this.branchForm.valid) {
      this.branchForm.patchValue({
        city_id: this.city_update.city_id
      })
      let branchData = { ...this.branchForm.value };
      if (branchData.city_id && typeof branchData.city_id === 'object') {
        branchData.city_id = branchData.city_id.city_id;
      }
  
      const payload = {
        updates: branchData, 
        conditions: `branches.branch_id=${this.branchForm.value.branch_id}`,
      };
  
      try {
        await firstValueFrom(
          this.branchService.updateBranch(payload).pipe(
            tap((res) => {
              this.alertService.success(res.message);
              this.fetchBranches();
              this.toggleAddState(); 
            })
          )
        );
      } catch (error: any) {
        this.alertService.error(error.error?.message || 'Error updating branch.');
      }
    } else {
      this.alertService.error('Please fill in all required fields correctly.');
    }
  }
  

  setAliseName() {
    this.branchForm.patchValue({
      alias_name: this.branchForm.get('branch_name')?.value

    })
  }

  toggleAddState() {
    this.showAddState = !this.showAddState;
    this.isEditing = false;
    this.branchForm.reset();
  }

  onFileChange(event: any) {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.selectedFileName = file.name,
          this.branchForm.patchValue({
            logo: reader.result as string,
          });
      };
    }
  }


  async addNewBranch() {
    if (this.branchForm.valid) {
      try {
        let data = { ...this.branchForm.value};
      if (data.city_id && typeof data.city_id === 'object') {
        data.city_id = data.city_id.city_id;
    }
        const response = await firstValueFrom(
          this.branchService.addNewBranch(data).pipe(
            tap((res) => {
              if (res.body) {
                this.alertService.success('Branch created successfully!');
                this.showAddState = false; // Close form
                this.fetchBranches(); // Refresh the list
              }
            })
          )
        );
      } catch (error: any) {
        // Catch any errors and display a user-friendly message
        console.log(error)
        const errorMessage = error.error.message || 'An error occurred while creating the branch.';
        this.alertService.error(errorMessage);
        console.error('Error adding branch:', error);
      }
    } else {
      // If the form is invalid, show relevant errors
      console.log('Invalid Form Data:');
      this.alertService.error('Please fill in all the required fields correctly.');
    }
  }
}
