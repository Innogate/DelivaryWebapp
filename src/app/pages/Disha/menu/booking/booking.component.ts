import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CityService } from '../../../../../services/city.service';
import { StateService } from '../../../../../services/state.service';
import { BranchService } from '../../../../../services/branch.service';
import { BookingService } from '../../../../../services/booking.service';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  imports: [DropdownModule, ButtonModule, FormsModule, InputTextModule],
  providers: [MessageService]
})
export class BookingComponent implements OnInit {
  states: any[] = [];
  cities: any[] = [];
  branches: any[] = [];
  transportModes: any[] = [];
  bookings: any[] = [];

  selectedState: any;
  selectedCity: any;
  selectedBranch: any;
  selectedTransportMode: any;

  constructor(
    private cityService: CityService,
    private stateService: StateService,
    private branchService: BranchService,
    private bookingService: BookingService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadStates();
    this.loadTransportModes();
    this.loadBookings();
  }

  async loadStates() {
    await firstValueFrom(this.stateService.getAllStates(0).pipe(
      tap(
        (res)=>{
          if(res.body){
            this.states = res.body;
          }
        }
      )
    ));

  }

  async onStateChange() {
    if (this.selectedState) {
      await firstValueFrom(this.cityService.getCitiesByStateId(this.selectedState).pipe(
        tap(
          (res)=>{
            if(res.body){
              this.cities = res.body;
            }
          }
        )
      ))
    } else {
      this.cities = [];
      this.branches = [];
    }
  }

  async onCityChange() {
    if (this.selectedCity) {
      await firstValueFrom(this.branchService.getBranchesByCityId(this.selectedCity).pipe(
        tap(
          (res)=>{
            if(res.body){
              this.branches = res.body;
            }
          }
        )
      ))
    } else {
      this.branches = [];
    }
  }

  loadTransportModes(): void {
    this.transportModes = [
      { label: 'Bus', value: 'bus' },
      { label: 'Train', value: 'train' },
      { label: 'Flight', value: 'flight' },
      { label: 'Cab', value: 'cab' }
    ];
  }

  loadBookings(): void {
    this.bookingService.getBookingList().subscribe(response => {
      this.bookings = response.data || [];
    });
  }

  book(): void {
    console.log("Not implemented");
  }

  deleteBooking(bookingId: number): void {
    this.bookingService.deleteBooking(bookingId).subscribe(response => {
      if (response.success) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Booking deleted successfully' });
        this.loadBookings();
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete booking' });
      }
    });
  }
}
