import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CityService } from '../../../../../services/city.service';
import { StateService } from '../../../../../services/state.service';
import { catchError, firstValueFrom, tap } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../services/alert.service';
import { throwError as rxjsThrowError } from 'rxjs';

@Component({
  selector: 'app-city',
  imports: [DropdownModule, CommonModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss'
})
export class CityComponent {

  showAddState: boolean = false;
  dropdownOptions = [];
  cityList?: any[];
  private touchStartY: number = 0;
  selectedValue: any;
  Form: FormGroup;


  constructor(private service: StateService, private cityService: CityService, private stateService: StateService,
    private fb: FormBuilder, private alertService: AlertService,
  ) {
    this.Form = this.fb.group({
      stateId: ['', [Validators.required]],
      cityName: ['', [Validators.required, Validators.minLength(3)]],
    });
  }
  ngOnInit() {
    this.GetAllState();
  }


  async GetAllState() {
    await firstValueFrom(this.stateService.getAllStates(0).pipe(
      tap(
        (res) => {
          if (res.body) {
            if (res.body) {
              this.dropdownOptions = res.body.map((states: any) => ({
                value: states.id,
                label: states.name
              }));
            }
          }
        },
        (error) => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }

  async getAllCity(data: any) {
    if (data?.value) {
      await firstValueFrom(this.cityService.getCitiesByStateId(data.value).pipe(
        tap(
          (res) => {
            if (res.body) {
              if (res.body) {
                this.cityList = res.body;
              }
            }
          },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      ))
    }
  }


  async addNewCity() {
    if (this.Form.valid) {
      await firstValueFrom(this.cityService.addNewCity(this.Form.value["cityName"], this.Form.value["stateId"]).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.alertService.success(res.message);
              this.showAddState = false;
              this.Form.reset();
            }
          },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      ))
    }
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
}
function throwError(message: string) {
  return rxjsThrowError(() => new Error(message));
}

