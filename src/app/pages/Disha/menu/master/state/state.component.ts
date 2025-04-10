import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog'; // ✅ Import DialogModule
import { ButtonModule } from 'primeng/button'; // ✅ Import ButtonModule
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, firstValueFrom, tap, throwError } from 'rxjs';
import { Theme } from '@primeng/themes';
import { StateService } from '../../../../../../services/state.service';
import { AlertService } from '../../../../../../services/alert.service';
import { GlobalStorageService } from '../../../../../../services/global-storage.service';
@Component({
  selector: 'app-state',
  imports: [DialogModule, FormsModule, CommonModule, ReactiveFormsModule, CommonModule],
  templateUrl: './state.component.html',
  styleUrl: './state.component.scss'
})
export class StateComponent {

  showAddState: boolean = false;
  stateForm: FormGroup;
  stateId?: number;
  isEditing: boolean = false;

  constructor(
    private service: StateService,
    private fb: FormBuilder,
    private alertservice: AlertService,
    private storage: GlobalStorageService
  ) {
    this.stateForm = this.fb.group({
      stateName: ['', [Validators.required, Validators.minLength(3)]]
    });
  }
  states: any[] = [];

  toggleAddState() {
    this.showAddState = !this.showAddState;
    this.isEditing = false;
    this.stateForm.reset();
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
  newStateName = '';
  ngOnInit() {
    this.storage.set('PAGE_TITLE', "STATE");
    this.GetAllState();
  }

  GetAllState() {
    const payload: any = {
      fields: ["state_id", "state_name"],
      max: 50,
      current: 0,
    }
    this.service.getAllStates(payload).pipe(
      tap((res) => {
        if (res.body) {
          this.states = res.body;
        }
      }),
      catchError((error) => {
        // this.alert.showErrorAlert(error.error.message);
        return throwError(() => error); // Ensure the observable doesn't break
      })
    ).subscribe(); // Subscribe to execute the observable
  }



  async addState() {
    if (this.stateForm.valid) {
      const newState = this.stateForm.value.stateName;
      await firstValueFrom(
        this.service.addNewState(newState).pipe(
          tap((response) => {
            this.alertservice.success(response.message);
            this.GetAllState();
            this.showAddState = false;
            this.stateForm.reset();
          },
            (error) => {
              this.alertservice.error(error.error.message);
            })
        )
      );
    }
  }

  viewState(state: any) {
    if (state) {
      this.isEditing = true;
      this.showAddState = true;
      this.stateForm.patchValue({ stateName: state.state_name });
      this.stateId = state.state_id;
    } else {
      this.isEditing = false;
      this.stateForm.reset();
    }
  }

  updateState() {
    if (this.stateId && this.stateForm.valid) {
      const payload: any = {
        updates: {
          "state_name": this.stateForm.get('stateName')?.value,
        },
        conditions: "state_id="+this.stateId

      };

      firstValueFrom(
        this.service.updateState(payload).pipe(
          tap((res) => {
            this.alertservice.success(res.message);
            this.GetAllState();
            this.showAddState = false;
            this.stateForm.reset();
          })
        )
      ).catch((error) => console.error('Error updating state:', error));
    }
  }


  async deleteState(state_id: any, status: boolean) {
    if (state_id) {
      const confirmation = this.alertservice.confirm("You want to delete this state ? ");
      if (await confirmation === false) {
        return;
      } else {
        await firstValueFrom(this.service.deleteState(state_id).pipe(
          tap((response) => {
            this.alertservice.success(response.message);
            this.GetAllState();
          },
            (error) => {
              this.alertservice.error(error.error.message);
            }
          ))
        )
      }
    }
  }
}


