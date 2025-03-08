import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-employ',
  imports: [DialogModule, ButtonModule, FormsModule,CommonModule,InputTextModule,
    DatePickerModule,DropdownModule],
  templateUrl: './employ.component.html',
  styleUrl: './employ.component.scss'
})
export class EmployComponent {

  showAddState: boolean = false;

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



  dropdownOptions = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' }
  ];
  selectedValue: any;
}
