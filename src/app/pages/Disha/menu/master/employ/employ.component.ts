import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
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

@Component({
  selector: 'app-employ',
  imports: [DialogModule, ButtonModule, FormsModule, CommonModule, InputTextModule,
    DatePickerModule, DropdownModule, ReactiveFormsModule,],
  templateUrl: './employ.component.html',
  styleUrl: './employ.component.scss',
  providers: [DatePipe]
})
export class EmployComponent {

  employeeForm: FormGroup;
  showAddState: boolean = false;
  employeeList?: any[];
  userList?: any[];
  employeeName?: any[];
  branchList?: any[];
  isEditing: boolean = false;
  filterType: string = 'all'; // Default filter

  constructor(private EmployeeService: EmployeesService, private branchService: BranchService, private datePipe: DatePipe,
    private alertService: AlertService, private userService: UserService, private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      EmployeeName: ['', Validators.required],
      address: [''],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      aadhar_no: ['', [Validators.pattern('^[0-9]{12}$')]],
      joining_date: [null],
      branch_id: [''],
      type: ['2'],
      designation: ['']
    });
  }
  ngOnInit() {
    this.gateAllEmployee();
    this.gateAllUser();
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
      fields: ["users.*", "employees.*"],
      max: 100,
      current: 0,
      relation: "users.id=employees.user_id"
    }
    await firstValueFrom(this.EmployeeService.getAllEmployees(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            console.log(res.body);
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
    console.log("Click on save");

    // Convert the joining_date to 'dd-MM-yyyy' format before sending the data
    let formData = { ...this.employeeForm.value };
    if (formData.joining_date) {
      formData.joining_date = this.datePipe.transform(formData.joining_date, 'dd-MM-yyyy');
    }

    console.log(formData); // Verify the formatted date

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
            return EMPTY; // Prevents breaking the observable chain
          })
        )
      );
    }
  }




  async deleteEmployee(employee: any) {
    if (employee.id) {
      const confirmation = this.alertService.confirm("You want to delete this Employee. ");
      if (await confirmation === false) {
        return;
      } else {
        await firstValueFrom(this.EmployeeService.deleteEmployee(employee.id).pipe(
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
    console.log(employee);
    this.employeeForm.patchValue({
      user_id: employee.user_id,
      address: employee.address,
      phone: employee.mobile,
      aadhar_no: employee.aadhar_no,
      joining_date: new Date(employee.joining_date),
      branch_id: employee.branch_id,
      type: employee.type
    });
  }


  async updateEmployee() {
    const payload = {
      updates: {
        "employees.address": this.employeeForm.controls['address'].value,
        "employees.aadhar_no": this.employeeForm.controls['aadhar_no'].value,
        "employees.joining_date": this.datePipe.transform(this.employeeForm.controls['joining_date'].value, 'dd-MM-yyyy'),
        "employees.branch_id": this.employeeForm.controls['branch_id'].value,
      },
      conditions: {
        "employees.user_id": this.employeeForm.controls['user_id'].value
      }
    }
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
