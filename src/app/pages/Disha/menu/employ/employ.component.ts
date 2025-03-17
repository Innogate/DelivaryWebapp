import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { EmployeesService } from '../../../../../services/employees.service';
import { AlertService } from '../../../../../services/alert.service';
import { firstValueFrom, tap } from 'rxjs';
import { UserService } from '../../../../../services/user.service';
import { payload } from '../../../../../../interfaces/payload.interface';
import { BranchService } from '../../../../../services/branch.service';

@Component({
  selector: 'app-employ',
  imports: [DialogModule, ButtonModule, FormsModule, CommonModule, InputTextModule,
    DatePickerModule, DropdownModule,ReactiveFormsModule],
  templateUrl: './employ.component.html',
  styleUrl: './employ.component.scss'
})
export class EmployComponent {

  employeeForm: FormGroup;
  showAddState: boolean = false;
  employeeList?: any[];
  userList?: any[];
  employeeName?: any[];
  branchList?: any[];

  constructor(private EmployeeService: EmployeesService,private branchService:BranchService, private alertService: AlertService, private userService: UserService,private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      user_id: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      aadharNo: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      gender: ['', Validators.required],
      joining_date: [null],
      birthDate: [null, Validators.required],
      adhara_no: ['', [Validators.maxLength(12)]],
      branch_id: [''],
      type: [0]

    });
  }
  ngOnInit() {
    this.gateAllEmployee();
  }
  toggleAddState() {
    this.showAddState = !this.showAddState;
    if (this.showAddState == true) {
      this.gateAllUser();
      this.fetchBranches();
    }
  }


  // Get all employ
  async gateAllEmployee() {
    const payload: payload = {
      fields : ["employees.*"],
      max : 100,
      current : 0,
      relation : null
    }
  await firstValueFrom(this.EmployeeService.getAllEmployees(payload).pipe(
    tap(
      (res) => {
        if (res.body) {
          this.employeeList = res.body;
        }
      },
      (error) => {
        this.alertService.error(error.error.message);
      }
    )
  ))
}


  async gateAllUser() {
  await firstValueFrom(this.userService.getAllUsers(0).pipe(
    tap(
      (res) => {
        if (res.body) {
          this.userList = res.body;
        }
        this.employeeName = this.userList?.map(user => ({
          label: `${user.first_name} ${user.last_name.trim()}`, // Full name display
          value: user.id // ID as value
        }));
      },
      (error) => {
        this.alertService.error(error.error.message);
      }
    )
  ))
}

onEmployeeChange(selectedId: number) {
  const selectedUser = this.userList?.find(user => user.id === selectedId);
  console.log(selectedUser);
  if (selectedUser) {
    this.employeeForm.patchValue({
      phone: selectedUser.mobile,
      address: selectedUser.address,
      birthDate: new Date(selectedUser.birth_date),
      gender: selectedUser.gender
    });
  }
}

async fetchBranches() {
  const payload: payload = {
    fields: ["branches.id", "branches.name"],
    max: 100,
    current: 0,
    relation: null
  };

  await firstValueFrom(this.branchService.getAllBranches(payload).pipe(
    tap((res) => {
      if (res.body && Array.isArray(res.body)) {
        this.branchList = res.body.map((branch:any) => ({
          label: branch.name,
          value: branch.id
        }));
      }
    })
  ));
}



 async onSave() {
  // if (this.employeeForm.valid) {
  //   const newEmployee = this.employeeForm.value;
  //   await firstValueFrom(
  //     this.EmployeeService.(newEmployee).pipe(
  //       tap((response) => {
  //         this.alertservice.success(response.message);
  //         this.GetAllState();
  //         this.showAddState = false;
  //         this.stateForm.reset();
  //       },
  //         (error) => {
  //           this.alertservice.error(error.error.message);
  //         })
  //     )
  //   );
  // }
}








onTouchStart(event: TouchEvent) {
  // Store the initial touch position
  this.touchStartY = event.touches[0].clientY;
}

onTouchEnd(event: TouchEvent) {
  // Get the final touch position
  const touchEndY = event.changedTouches[0].clientY;

  // Detect swipe down (close slider)
  if (touchEndY - this.touchStartY > 50) {
    this.showAddState = false;
  }
}

  private touchStartY: number = 0;



dropdownOptions = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' }
];
selectedValue: any;
}
