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
import { catchError, firstValueFrom, tap } from 'rxjs';
import { AlertService } from '../../../../../services/alert.service';
import { payload } from '../../../../../../interfaces/payload.interface';
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
  isEditing: boolean = false;
  company_id: number = 1;
  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private companyService: CompanyService,
    private stateService: StateService,
    private cityService: CityService,
    private alertService: AlertService
  ) {
    this.branchForm = this.fb.group({
      company_id: [this.company_id, [Validators.required, Validators.min(1)]], 
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(3)]],
      alias_name: ['', [Validators.minLength(3)]],
      city_id: ['', [Validators.required, Validators.min(1)]],
      state_id: ['', [Validators.required, Validators.min(1)]],
      pin_code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      contact_no: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['',],
      gst_no: ['',],
      cin_no: ['',],
      udyam_no: ['',],
      logo: [''],
      cgst: ['', [Validators.required,]],
      sgst: ['', [Validators.required]],
      igst: ['', [Validators.required]],
    });
    this.fetchBranches();
    this.loadStates();
  }

  async fetchBranches() {
    const payload: payload = {
      fields: ["branches.*"],
      max: 100,
      current: 0,
      relation: null
    };
    await firstValueFrom(this.branchService.getAllBranches(payload).pipe(
      tap((res) => {
        if (res.body) {
          this.branchList = res.body;
        }
      })
    ));
  }



  async loadStates() {
    await firstValueFrom(
      this.stateService.getAllStates({
        fields: ["states.id", "states.name"],
        max: 50,
        current: 0,
        relation: null
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

  async onStateChange(stateId: any) {
    await firstValueFrom(this.cityService.getCitiesByStateId({
      "fields": ["cities.id", "cities.name"],
      "max": 100,
      "current": 0,
      "relation": null,
      "state_id": stateId
    }).pipe(
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

  async deleteBranch(branch: any) {
    if (branch) {
      const confirmation = this.alertService.confirm("You want to delete this state ? ");
      if (await confirmation === false) {
        return;
      } else {
        await firstValueFrom(this.branchService.deleteBranch(branch.id).pipe(
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
      this.branchForm.patchValue({
        company_id: branch.company_id,
        name: branch.name,
        address: branch.address,
        alias_name: branch.alias_name,
        city_id: branch.city_id,
        state_id: branch.state_id,
        pin_code: branch.pin_code,
        contact_no: branch.contact_no,
        email: branch.email,
        gst_no: branch.gst_no,
        cin_no: branch.cin_no,
        udyam_no: branch.udyam_no,
        cgst: branch.cgst,
        sgst: branch.sgst,
        igst: branch.igst,
      });
    }
  }

  updateBranch(){
    console.log(this.branchForm.value);
  }

  toggleAddState() {
    this.showAddState = !this.showAddState;
    this.isEditing = false;
    this.branchForm.reset();
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
    if (this.branchForm.valid && this.company_id) {
      await firstValueFrom(
        this.branchService.addNewBranch(this.branchForm.value).pipe(
          tap((res) => {
            if (res.body) {
              this.alertService.success('Branch created successfully');
              this.showAddState = false;
              this.fetchBranches();
            }
          }),
          catchError((error) => {
            this.alertService.error(error?.error?.message || 'An error occurred while creating the branch.');
            return []; // Return an empty array to gracefully handle errors
          })
        )
      );
    } else {
      console.log(this.branchForm.value, this.company_id);
      this.alertService.error('Please fill all the required fields');
    }
  }
  
}