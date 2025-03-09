import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GlobalStorageService } from '../../../services/global-storage.service';
import { LoginService } from '../../../services/login.service';
import { AlertService } from '../../../services/alert.service';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { firstValueFrom, tap } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  userFrom?: FormGroup;
  constructor(
    private loginService: LoginService,
    private globalStorageService: GlobalStorageService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private router: Router
  ){}

  ngOnInit(): void {
    this.userFrom = this.fb.group({
      id: ['', [Validators.required, Validators.min(10)]],
      passwd: ['', [Validators.required, Validators.minLength(6)]],
    })
  }

  async onSubmit() {
    if (this.userFrom?.valid) {
      await firstValueFrom(this.loginService.login(this.userFrom.value).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.globalStorageService.set('token', res.body.token, true);
              this.router.navigate(['/']);
            }
          },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      ))
    }else{
      this.userFrom?.markAllAsTouched();
    }
  }
}
