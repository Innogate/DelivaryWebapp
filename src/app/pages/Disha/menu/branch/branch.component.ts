import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BranchService } from '../../../../../services/branch.service';
import { CompanyService } from '../../../../../services/company.service';
import { StateService } from '../../../../../services/state.service';
import { CityService } from '../../../../../services/city.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { firstValueFrom, tap } from 'rxjs';
import { AlertService } from '../../../../../services/alert.service';
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
    CardModule
  ]
})
export class BranchComponent {
  branchForm: FormGroup;
  companies: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  branchList: any[] = [];
  showAddState: boolean = false;
  selectedFileName: string = '';
  private touchStartY: number = 0;

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private companyService: CompanyService,
    private stateService: StateService,
    private cityService: CityService,
    private alertService: AlertService
  ) {
    this.branchForm = this.fb.group({
      company_id: ['', [Validators.required, Validators.min(1)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(3)]],
      alias_name: ['', [Validators.required, Validators.minLength(3)]],
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
    this.fetchBranches();
    this.loadStates();
  }

  async fetchBranches() {
    await firstValueFrom(this.branchService.getAllBranches(0).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.branchList = res.body;
          }
        }
      )
    ));
  }


  async loadStates() {
    await firstValueFrom(
      this.stateService.getAllStates().pipe(
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

  async onStateChange(stateId: any) {
    await firstValueFrom(this.cityService.getCitiesByStateId(stateId).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.cities = res.body;
          }
        }
      )
    ))
  }

  async onCityChange(cityId: any) {
    await firstValueFrom(this.companyService.getCompaniesByCity(cityId).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.companies = res.body;
          }
        }
      )
    ))
  }

  deleteBranch(branch: any) {
    console.log("Delete branch", branch);
  }

  updateBranch(branch: any) {
    console.log('Update branch', branch);
  }

  toggleAddState() {
    this.showAddState = !this.showAddState;
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
        await firstValueFrom(this.branchService.addNewBranch(this.branchForm.value).pipe(
          tap(
            (res) => {
              if (res.body) {
                this.alertService.success('Branch created successfully');
                this.showAddState = false;
                this.fetchBranches();
              }
            },
            (error) => {
              this.alertService.error(error.error.message);
            }
          )
        ))
      }
      catch (error) {
        this.alertService.error("Server connection failure please try later !")
      }
    }
    else{
      this.alertService.error('Please fill all the required fields');
      console.log(this.branchForm.value)
    }
  }
}