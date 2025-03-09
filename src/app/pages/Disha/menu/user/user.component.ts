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

@Component({
  selector: 'app-user',
  imports: [DialogModule, ButtonModule, FormsModule, CommonModule, InputTextModule,
    DatePickerModule, DropdownModule, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  showAddState: boolean = false;
  userList?: any[];
  addUserForm: FormGroup;
  private touchStartY: number = 0;
  dropdownOptions = [{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }];
  selectedValue: any;
  passwordVisible = false;

  constructor(private alertService: AlertService, private userService: UserService, private fb: FormBuilder) {
    this.addUserForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      address: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birth_date: [null, Validators.required],
      gender: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.gateAllUser();
  }

  
  // gate all user 
  async gateAllUser() {
    await firstValueFrom(this.userService.getAllUsers(0).pipe(
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
  async onSave() {
    if (this.addUserForm.valid) {
      await firstValueFrom(this.userService.addNewUser(this.addUserForm.value).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.alertService.success('User created successfully');
              this.showAddState = false;
              this.gateAllUser();
            }
          },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      ))
<<<<<<< HEAD
=======
    }
    catch (error) {
      this.alertService.error("Server connection failure please try agen !")
    }
  }


   // create a new user
  async addUser() {
    if (this.addUserForm.valid) {
      try {
        await firstValueFrom(this.userService.addNewUser(this.addUserForm.value).pipe(
          tap(
            (res) => {
              if (res.body) {
                this.alertService.success(res.message);
                this.showAddState = false;
                this.gateAllUser();
              }
            },
            (error) => {
              this.alertService.error(error.error.message);
            }
          )
        ))
      } catch {
        this.alertService.error("Server connection failure please try agen !")
      }
>>>>>>> bfef373 (user master add new user)
    } else {
      this.addUserForm.markAllAsTouched(); // Show all validation errors
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
  }

  getGenderLabel(value: string) {
    return this.dropdownOptions.find(option => option.value === value)?.label || 'Unknown';
  }
}
