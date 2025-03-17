import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { firstValueFrom, tap } from 'rxjs';
import { AlertService } from '../../../../../services/alert.service';
import { UserService } from '../../../../../services/user.service';
import { PasswordModule } from 'primeng/password'
@Component({
  selector: 'app-user',
  imports: [DialogModule, ButtonModule, FormsModule, CommonModule, InputTextModule,
    DatePickerModule, DropdownModule, ReactiveFormsModule, PasswordModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  showAddState: boolean = false;
  showPassword: boolean = false;
  userList?: any[];
  addUserForm: FormGroup;
  private touchStartY: number = 0;
  dropdownOptions = [{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }];
  selectedValue: any;
  passwordVisible = false;
  isEditing: boolean = false;

  constructor(private alertService: AlertService, private userService: UserService, private fb: FormBuilder) {
    this.addUserForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      address: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['example@gmail.com', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birth_date: [null, Validators.required],
      gender: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.gateAllUser();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // gate all user
  async gateAllUser() {
    const payload = {
      fields : ["users.*","user_info.*"],
      max : 100,
      current : 0,
      relation : "users.id=user_info.id"
    }
    await firstValueFrom(this.userService.getAllUsers(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            if (res.body) {
              this.userList = res.body;
            }
          }
        },
        (error) => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }

  // create a new user
  async addUser() {
    if (this.addUserForm.valid) {
      await firstValueFrom(this.userService.addNewUser(this.addUserForm.value).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.alertService.success(res.message);
              this.showAddState = false;
              this.gateAllUser();
              this.addUserForm.reset();
            }
          },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      ))
    } else {
      this.addUserForm.markAllAsTouched();
    }
  }


  async deleteUser(data: any) {
    if (data) {
      const confirmation = this.alertService.confirm("You want to delete this User ? ");
      if (await confirmation === false) {
        return;
      } else {
        await firstValueFrom(this.userService.deleteUser(data.id).pipe(
          tap((response) => {
            this.alertService.success(response.message);
            this.gateAllUser();
          },
            (error) => {
              this.alertService.error(error.error.message);
            }
          ))
        )
      }
    }
  }

  viewUser(data: any){
    if(data){
      this.showAddState = true;
      this.isEditing = true;
      this.addUserForm.patchValue({
        first_name: data.first_name,
        last_name: data.last_name,
        address: data.address,
        mobile: data.mobile,
        email: data.email,
        birth_date: new Date(data.birth_date),
        gender: data.gender,
        password: data.password
      });
    }
  }

  updateUser() {
    console.log(this.addUserForm.value);
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

  togglePassword(user: any) {
    user.showPassword = !user.showPassword;
  }

  toggleFormPassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleAddState() {
    this.showAddState = !this.showAddState;
    this.isEditing = false;
    this.addUserForm.reset();
  }

  getGenderLabel(value: string) {
    return this.dropdownOptions.find(option => option.value === value)?.label || 'Unknown';
  }

}
