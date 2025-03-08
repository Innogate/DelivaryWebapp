import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog'; // ✅ Import DialogModule
import { ButtonModule } from 'primeng/button'; // ✅ Import ButtonModule
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';
import { catchError, tap, throwError } from 'rxjs';
@Component({
  selector: 'app-state',
  imports: [DialogModule, ButtonModule, FormsModule,CommonModule],
  templateUrl: './state.component.html',
  styleUrl: './state.component.scss'
})
export class StateComponent {

  showAddState: boolean = false;
  constructor(private service: StateService){}

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






  states: {id:number, stateName: String}[] = [];
  newStateName = '';
  ngOnInit() {
    this.GetAllState();

  }

  GetAllState() {
    this.service.getAllStates(0).pipe(
      tap((res) => {
        if (res.body) {
          this.states = res.body.map((states: any) => ({
            id: states.id,
            stateName: states.name
          }));
      }
      }),
      catchError((error) => {
        // this.alert.showErrorAlert(error.error.message);
        return throwError(() => error); // Ensure the observable doesn't break
      })
    ).subscribe(); // Subscribe to execute the observable
  }


  addState() {
    if (this.newStateName.trim()) {
      console.log('State Added:', this.newStateName);
      this.newStateName = '';
      this.toggleAddState();
    }
  }
}


