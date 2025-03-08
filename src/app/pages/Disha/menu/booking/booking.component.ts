import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-booking',
  imports: [InputTextModule,DropdownModule,FormsModule,FloatLabelModule,ButtonModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent {
  dropdownOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' }
  ];
  selectedValue: any;
}
