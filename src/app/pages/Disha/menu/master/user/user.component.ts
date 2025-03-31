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
import { GlobalStorageService } from '../../../../../../services/global-storage.service';
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
    private router: Router,
    private storage: GlobalStorageService
) {
    this.addUserForm = this.fb.group({
      full_name: ['', Validators.required],  // Single input field
      first_name: [''],
      last_name: [''],
      address: [null],
      mobile: ['', [Validators.required]],
      email: ['example@gmail.com', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birth_date: [null],
      gender: [null,]
    });
  }

  ngOnInit() {
    this.storage.set('PAGE_TITLE', "USER");
    this.gateAllUser();
  }

  splitName() {
    const fullName = this.addUserForm.get('full_name')?.value || '';
    const nameParts = fullName.trim().split(/\s+/); // Split by spaces

    this.addUserForm.patchValue({
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '' // Join remaining parts as last name
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // gate all user
  async gateAllUser() {
    const payload = {
      fields: [],
      max: 100,
      current: 0
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
        await firstValueFrom(this.userService.deleteUser(data.user_id).pipe(
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
      this.userId = data.user_id;

      const fullName = `${data.first_name} ${data.last_name}`.trim();

      this.addUserForm.patchValue({
        full_name: fullName,
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
      const fullName = this.addUserForm.value.full_name.trim();
      const nameParts = fullName.split(/\s+/);
      const payload = {
        updates: {
          "first_name": nameParts[0] || '',
          "last_name": nameParts.slice(1).join(' ') || '',
          "email": this.addUserForm.value.email,
          "birth_date": this.addUserForm.value.birth_date.toISOString(),
          "gender": this.addUserForm.value.gender,
          "password": this.addUserForm.value.password,
          "mobile": this.addUserForm.value.mobile,
          "address": this.addUserForm.value.address
        },
        conditions: "user_id="+this.userId,
      };

      await firstValueFrom(this.userService.updateUser(payload).pipe(
        tap((response) => {
          this.alertService.success(response.message);
          this.gateAllUser();
          this.showAddState = false;
          this.addUserForm.reset();
        },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
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
    this.router.navigate(["/pages/access/" + user.user_id]);
  }
}
