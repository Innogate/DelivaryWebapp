import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { firstValueFrom, switchMap, tap, throwError } from 'rxjs';
import { AlertService } from '../../../../../../services/alert.service';
import { UserService } from '../../../../../../services/user.service';
import { PasswordModule } from 'primeng/password'
import { Router } from '@angular/router';
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
  userId?: number;

  constructor(
    private alertService: AlertService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
) {
    this.addUserForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      address: [null],
      mobile: ['', [Validators.required]],
      email: ['example@gmail.com', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birth_date: [null],
      gender: [null,]
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
      fields: ["users.*", "user_info.*"],
      max: 100,
      current: 0,
      relation: "users.id=user_info.id"
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

  // Delete User
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
  // View User
  viewUser(data: any) {
    if (data) {
      this.showAddState = true;
      this.isEditing = true;
      console.log(data);
      this.userId = data.id;
      this.addUserForm.patchValue({
        first_name: data.first_name,
        last_name: data.last_name,
        mobile: data.mobile,
        email: data.email,
        birth_date: new Date(data.birth_date),
        gender: data.gender,
        password: data.password
      });
    }
  }

  async updateUser() {
    if (this.addUserForm.valid) {
      const payload = {
        updates: {
          "user_info.first_name": this.addUserForm.value.first_name,
          "user_info.last_name": this.addUserForm.value.last_name,
          "user_info.email": this.addUserForm.value.email,
          "user_info.birth_date": this.addUserForm.value.birth_date.toISOString(),
          "user_info.gender": this.addUserForm.value.gender,
        },
        conditions: {
          "user_info.id": this.userId,
        }
      };

      const payload2 = {
        updates: {
          "users.password": this.addUserForm.value.password,
          "users.mobile": this.addUserForm.value.mobile,
        },
        conditions: {
          "users.id": this.userId
        }
      }

      await firstValueFrom(this.userService.updateUser(payload).pipe(
        tap(async (response) => {
          if (response.status == 200) {
            await firstValueFrom(this.userService.updateUser(payload2).pipe(
              tap((res) => {
                if (res.status == 200) {
                  this.alertService.success(res.message);
                  this.gateAllUser();
                  this.showAddState = false;
                  this.addUserForm.reset();
                }
              },
                (error) => {
                  this.alertService.error(error.error.message);
                })
            ))
          }
        }, (error) => {
          this.alertService.error(error.error.message);
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

  grandUser(user: any) {
    this.router.navigate(["/pages/access/" + user.id]);
  }
}
