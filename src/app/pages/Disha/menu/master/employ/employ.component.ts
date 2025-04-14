import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, EMPTY, firstValueFrom, tap } from 'rxjs';
import { ThLargeIcon } from 'primeng/icons';
import { EmployeesService } from '../../../../../../services/employees.service';
import { UserService } from '../../../../../../services/user.service';
import { BranchService } from '../../../../../../services/branch.service';
import { AlertService } from '../../../../../../services/alert.service';
import { GlobalStorageService } from '../../../../../../services/global-storage.service';

@Component({
  selector: 'app-employ',
  imports: [DialogModule, ButtonModule, FormsModule, CommonModule, InputTextModule,
    DatePickerModule, DropdownModule, ReactiveFormsModule,],
  templateUrl: './employ.component.html',
  styleUrl: './employ.component.scss',
  providers: [DatePipe]
})
export class EmployComponent implements OnInit {

  employeeForm: FormGroup;
  showAddState: boolean = false;
  employeeList?: any[];
  userList?: any[];
  employeeName?: any[];
  branchList?: any[];
  isEditing: boolean = false;
  filterType: string = 'all'; // Default filter

  constructor(
    private EmployeeService: EmployeesService,
    private branchService: BranchService,
    private datePipe: DatePipe,
    private alertService: AlertService,
    private userService: UserService,
    private fb: FormBuilder,
    private storage: GlobalStorageService
  ) {
    this.employeeForm = this.fb.group({
      employee_id: [null],
      employee_name: ['', Validators.required],
      address: [''],
      employee_mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      aadhar_no: ['', [Validators.pattern('^[0-9]{12}$')]],
      joining_date: [null],
      designation: ['']
    });
  }
  ngOnInit() {
    this.storage.set('PAGE_TITLE', "EMPLOYEE");
    this.gateAllEmployee();
    // this.gateAllUser();
    this.fetchBranches();
  }
  toggleAddState() {
    this.showAddState = !this.showAddState;
    if (this.showAddState == true) {
      this.employeeForm.reset();
      this.isEditing = false;
    }
  }


  // Get all employ
  async gateAllEmployee() {
    const payload: any = {
      fields: [],
      max: 10,
      current: 0
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


  // async gateAllUser() {
  //   await firstValueFrom(this.userService.getAllUsers(0).pipe(
  //     tap(
  //       (res) => {
  //         if (res.body) {
  //           this.userList = res.body;
  //         }
  //         this.employeeName = this.userList?.map(user => ({
  //           label: `${user.first_name} ${user.last_name.trim()}`,
  //           value: user.id
  //         }));
  //       },
  //       (error) => {
  //         this.alertService.error(error.error.message);
  //       }
  //     )
  //   ))
  // }

  onEmployeeChange(selectedId: number) {
    const selectedUser = this.userList?.find(user => user.id === selectedId);
    if (selectedUser) {
      this.employeeForm.patchValue({
        phone: selectedUser.mobile,
        birthDate: new Date(selectedUser.birth_date),
        gender: selectedUser.gender
      });
    }
  }

  async fetchBranches() {
    const payload: any = {
      fields: ["branches.id", "branches.name"],
      max: 100,
      current: 0,
      relation: null
    };

    await firstValueFrom(this.branchService.getAllBranches(payload).pipe(
      tap((res) => {
        if (res.body && Array.isArray(res.body)) {
          this.branchList = res.body.map((branch: any) => ({
            label: branch.name,
            value: branch.id
          }));
        }
      })
    ));
  }



  async onSave() {
    let formData = { ...this.employeeForm.value };
    if (formData.joining_date) {
      formData.joining_date = this.datePipe.transform(formData.joining_date, 'yyyy-MM-dd');
    }

    if (this.employeeForm.valid) {
      await firstValueFrom(
        this.EmployeeService.addNewEmployee(formData).pipe(
          tap(response => {
            this.alertService.success(response.message);
            this.gateAllEmployee();
            this.showAddState = false;
            this.employeeForm.reset();
          }),
          catchError(error => {
            this.alertService.error(error?.error?.message || "Failed to add employee");
            return EMPTY;
          })
        )
      );
    }
  }




  async deleteEmployee(employee: any) {
    if (employee.employee_id) {
      const confirmation = this.alertService.confirm("You want to Inactive this Employee. ");
      if (await confirmation === false) {
        return;
      } else {
        await firstValueFrom(this.EmployeeService.deleteEmployee(employee.employee_id).pipe(
          tap((response) => {
            this.alertService.success(response.message);
            this.gateAllEmployee();
          },
            (error) => {
              this.alertService.error(error.error.message);
            }
          ))
        )
      }
    }
  }

  viewEmployee(employee: any) {
    this.isEditing = true;
    this.showAddState = true;

    this.employeeForm.patchValue({
      employee_name: employee.employee_name,
      address: employee.address,
      employee_mobile: employee.employee_mobile,
      aadhar_no: employee.aadhar_no,
      joining_date: new Date(employee.joining_date),
      designation: employee.designation,
      employee_id: employee.employee_id
    });

  }


  async updateEmployee() {
    const payload = {
      updates: {
        "employee_name": this.employeeForm.controls['employee_name'].value,
        "address": this.employeeForm.controls['address'].value,
        "employee_mobile": this.employeeForm.controls['employee_mobile'].value,
        "aadhar_no": this.employeeForm.controls['aadhar_no'].value,
        "joining_date": this.datePipe.transform(this.employeeForm.controls['joining_date'].value, 'yyyy-MM-dd'),
        "designation": this.employeeForm.controls['designation'].value,
      },
      conditions: `employee_id=${this.employeeForm.controls['employee_id'].value}`
    };
    
    if (this.employeeForm.valid) {
      await firstValueFrom(this.EmployeeService.updateEmployee(payload).pipe(
        tap(response => {
          this.alertService.success(response.message);
          this.gateAllEmployee();
        }),
        catchError(error => {
          this.alertService.error(error?.error?.message);
          return EMPTY;
        })
      ))
    }

  }





  async activeUser(data: any) {

    const payload = {
      updates: {
        status: 1
      },
      conditions: `employee_id=${data.employee_id}`
    };
    
    if (data.employee_id) {
      await firstValueFrom(this.EmployeeService.updateEmployee(payload).pipe(
        tap(response => {
          this.alertService.success(response.message);
          this.gateAllEmployee();
        }),
        catchError(error => {
          this.alertService.error(error?.error?.message);
          return EMPTY;
        })
      ))
    }

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
  get filteredEmployees() {
    if (this.filterType === 'active') {
      return this.employeeList?.filter(emp => emp.status);
    } else if (this.filterType === 'inactive') {
      return this.employeeList?.filter(emp => !emp.status);
    }
    return this.employeeList; // Show all
  }

  setFilter(type: string) {
    this.filterType = type;
  }
}
