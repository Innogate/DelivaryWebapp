import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog'; // ✅ Import DialogModule
import { ButtonModule } from 'primeng/button'; // ✅ Import ButtonModule
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, tap, throwError } from 'rxjs';
import { StateService } from '../../../../../services/state.service';
@Component({
  selector: 'app-state',
  imports: [DialogModule, ButtonModule, FormsModule,CommonModule,ReactiveFormsModule,CommonModule],
  templateUrl: './state.component.html',
  styleUrl: './state.component.scss'
})
export class StateComponent {

  showAddState: boolean = false;
  stateForm: FormGroup;

 constructor(private service: StateService,private fb: FormBuilder) {
  this.stateForm = this.fb.group({
    stateName: ['', [Validators.required, Validators.minLength(3)]]
  });
  }
 states: any[] = [];

  toggleAddState() {
    this.showAddState = !this.showAddState;
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
    this.GetAllState();
  }

  GetAllState() {
    this.service.getAllStates(0).pipe(
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
  


  addState() {
    if (this.stateForm.valid) {
      const newState:any = this.stateForm.value.stateName;
      this.service.addNewState(newState).subscribe(
        (res) => {
          alert(res.message)
          this.GetAllState(); 
          this.showAddState = false;
          this.stateForm.reset();
        },
        (error) => {
          console.error('Error adding state:', error);
        }
      );
    }
  }
}


