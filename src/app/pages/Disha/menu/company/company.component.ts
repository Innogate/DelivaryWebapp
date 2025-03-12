import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from "primeng/button";
import { DataViewModule } from "primeng/dataview";
import { OrderListModule } from "primeng/orderlist";
import { PickListModule } from "primeng/picklist";
import { SelectButtonModule } from "primeng/selectbutton";
import { TagModule } from "primeng/tag";
import { Product, ProductService } from "../../../service/product.service";
import { Component } from "@angular/core";
import { StateService } from "../../../../../services/state.service";
import { catchError, throwError } from "rxjs";
import { firstValueFrom, tap } from 'rxjs';
import { AlertService } from "../../../../../services/alert.service";
import { UserService } from "../../../../../services/user.service";
import { BranchService } from "../../../../../services/branch.service";
import { CityService } from "../../../../../services/city.service";
import { DropdownModule } from "primeng/dropdown";
import { CompanyService } from "../../../../../services/company.service";




@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, DropdownModule, DataViewModule, FormsModule, ReactiveFormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss',
  providers: [ProductService]
})
export class CompanyComponent {
  showAddState: boolean = false;
  states: any[] = [];
  cities: any[] = [];
  branches: any[] = [];
  companyList?: any[];
  private touchStartY: number = 0;
  dropdownOptions = [{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }];
  selectedValue: any;
  passwordVisible = false;

  companyForm: FormGroup;
  selectedState: any;
  selectedCity: any;
  selectedFileName: string = '';

  constructor(private service: StateService,
    private cityService: CityService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private companyService: CompanyService,
    private stateService: StateService
  ) {

    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(3)]],
      city_id: ['', [Validators.required, Validators.min(1)]],
      state_id: ['', [Validators.required, Validators.min(1)]],
      pin_code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      contact_no: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      gst_no: ['', [Validators.required]],
      cin_no: ['', [Validators.required]],
      udyam_no: ['', [Validators.required]],
      logo: ['']
    });
  }

  ngOnInit() {
    this.gateAllCompany();
  }


  async gateAllCompany() {
    await firstValueFrom(this.companyService.getAllCompanies(0).pipe(
      tap(
        (res) => {
          if (res.body) {
            if (res.body) {
              this.companyList = res.body;
            }
          }
        },
        (error) => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }


  async onSubmit() {
    if (this.companyForm.valid) {
      await firstValueFrom(this.companyService.addNewCompany(this.companyForm.value).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.alertService.success(res.message);
              this.showAddState = false;
              this.gateAllCompany();
            }
          },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      ))
    } else {
      this.companyForm.markAllAsTouched(); // Show all validation errors
    }
  }



  async onStateChange(stateId: any) {
    await firstValueFrom(this.cityService.getCitiesByStateId({
      "fields": ["cities.id", "cities.name"],
      "max": 12,
      "current": 0,
      "relation": null,
      "state_id": stateId
    }).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.cities = res.body;
          }
        },
        (error) => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }

  onTouchStart(event: TouchEvent) {
    // Store the initial touch position
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent) {
    const touchEndY = event.changedTouches[0].clientY;
    if (touchEndY - this.touchStartY > 50) {
      this.showAddState = false;
    }
  }

  toggleAddState() {
    this.showAddState = !this.showAddState;
    this.getAllState();
  }



  togglePassword(user: any) {
    user.showPassword = !user.showPassword;
  }

  toggleFormPassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  getGenderLabel(value: string) {
    return this.dropdownOptions.find(option => option.value === value)?.label || 'Unknown';
  }


  addCompany() {
    if (this.companyForm.valid) {
      const newState: any = this.companyForm.value.companyName;
      this.service.addNewState(newState).subscribe(
        (res) => {
          alert(res.message)
          this.getAllState();
          this.showAddState = false;
          this.companyForm.reset();
        },
        (error) => {
          console.error('Error adding state:', error);
        }
      );
    }
  }

  async getAllState() {
    await firstValueFrom(this.stateService.getAllStates({
      fields: ["states.id", "states.name"],
      max: 12,
      current: 0,
      relation: null
    }).pipe(
      tap(
        (res) => {
          if (res.body) {
            if (res.body) {
              this.states = res.body;
            }
          }
        },
        (error) => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }

  onFileChange(event: any) {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.selectedFileName = file.name,
          this.companyForm.patchValue({
            logo: reader.result as string,
          });
      };
    }
  }


}
