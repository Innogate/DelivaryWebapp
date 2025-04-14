import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CityService } from '../../../../../../services/city.service';
import { StateService } from '../../../../../../services/state.service';
import { catchError, firstValueFrom, last, tap } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../../services/alert.service';
import { throwError as rxjsThrowError } from 'rxjs';
import { Theme } from '@primeng/themes';
import { ThLargeIcon } from 'primeng/icons';
import { GlobalStorageService } from '../../../../../../services/global-storage.service';

@Component({
  selector: 'app-city',
  imports: [DropdownModule, CommonModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss'
})
export class CityComponent implements OnInit {

  showAddState: boolean = false;
  dropdownOptions = [];
  cityList: any[] = [];
  private touchStartY: number = 0;
  selectedValue: any;
  Form: FormGroup;
  isEditing: boolean = false;
  stateId: any;
  cityId: any;

  max: number = 10;
  current: number = 0;


  constructor(
    private service: StateService,
    private cityService: CityService,
    private stateService: StateService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private storage: GlobalStorageService
  ) {
    this.Form = this.fb.group({
        state_id: ['', [Validators.required]],
      city_name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }
  ngOnInit() {
    this.storage.set('PAGE_TITLE', "CITY");
    this.GetAllState();
  }


  async GetAllState() {
    await firstValueFrom(this.stateService.getAllStates({
      fields: [],
      max: 50,
      current: this.current
    }).pipe(
      tap(
        (res) => {
          if (res.body) {
            if (res.body) {
              this.dropdownOptions = res.body;
              this.current = this.dropdownOptions.length;
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
      await firstValueFrom(this.cityService.getCitiesByStateId({
        "fields": [],
        "max": 300,
        "current": 0,
        "state_id": data.value
      }).pipe(
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
      const payload = this.Form.value;
      await firstValueFrom(this.cityService.addNewCity(payload).pipe(
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


  async deleteCity(city: any) {
    if (city.id) {
      const responce = await this.alertService.confirm('you want to delete this city');
      if (responce === false) {
        return;
      } else {
        await firstValueFrom(this.cityService.deleteCity(city.id).pipe(
          tap((response) => {
            this.alertService.success(response.message);
            this.getAllCity({ value: city.state_id, });
          },
            (error) => {
              this.alertService.error(error.error.message);
            }
          )
        ))
      }
    }
  }

  async viewCity(city: any) {
    if (city) {
      this.cityId = city.city_id;
      this.isEditing = true;
      this.showAddState = true;
      this.Form.patchValue({
        state_id: city.state_id,
        city_name: city.city_name
      });
    }
  }


  updateCity() {
    if (this.cityId && this.Form.valid) {
      const payload: any = {
        updates: {
          "cities.name": this.Form.get('cityName')?.value,
        },
        conditions: {
          "cities.id": this.cityId
        }
      };
      firstValueFrom(
        this.service.updateState(payload).pipe(
          tap((res) => {
            this.alertService.success(res.message);
            // this.getAllCity(this.Form.get('stateId')?.value);
            this.showAddState = false;
            this.Form.reset();
          })
        )
      ).catch((error) => this.alertService.error('Error updating state:', error));
    }
  }





  toggleAddState() {
    this.showAddState = !this.showAddState;
    this.isEditing = false;
    this.Form.reset();
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
