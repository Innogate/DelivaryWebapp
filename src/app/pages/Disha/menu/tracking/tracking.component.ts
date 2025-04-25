import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StepsModule } from 'primeng/steps';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { InputTextModule } from 'primeng/inputtext';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, EMPTY, firstValueFrom, tap } from 'rxjs';
import { TrakingService } from '../../../../../services/traking.service';
import { AlertService } from '../../../../../services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { IconFieldModule } from 'primeng/iconfield';
import { deliveryService } from '../../../../../services/delivery.service';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [
    CommonModule,
    StepsModule,
    StepperModule,
    ButtonModule,
    TimelineModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    IconFieldModule,
    DialogModule
  ],
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.scss'
})
export class TrackingComponent implements OnInit {
  timelineSteps: any[] = [];
  isView: boolean = false;
  booking: any = {};
  search: FormGroup;
  base64File: string | null = null; // This will store the Base64 string of the file.
  displayImagePopup = false;
  zoom = 1;
  constructor(
    private route: ActivatedRoute,
    private trakingService: TrakingService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private deliveryService: deliveryService
  ) {
    this.search = this.fb.group({
      slip_no: ['', [Validators.required, Validators.pattern('^[A-Za-z]+[0-9]+$')]]
    });
  }

  ngOnInit(): void {}

  searchPackage(): void {
    if (this.search.valid) {
      const slipNo = this.search.value.slip_no;
      this.trakingBookings(slipNo);
    }
  }

  async trakingBookings(slip_no: string): Promise<void> {
    const payload = { slip_no };

    await firstValueFrom(
      this.trakingService.trakingBooking(payload).pipe(
        tap(response => {
          const statusList = response.body.status;
          this.booking = response.body.booking;
          if(this.booking.booking_id){
            this.gatePodById(this.booking.booking_id);
          }
          this.timelineSteps = []; // Clear previous results
          this.isView = true;
          if (statusList && statusList.length != 0) {
            // Initial booking step
           
            // Intermediate steps
            statusList.forEach((step: any, index: number) => {
              this.timelineSteps.push({
                // `Arrived at ${step.destination_branch_name}`
                title: step.source_branch_name != null ? `Arrived at ${step.source_branch_name}` : `Oder just placed please wait`,
                date: step.arrived_at,
                status: 'completed'
              });

              this.timelineSteps.push({
                title: step.destination_branch_name != null ? `Departed from ${step.destination_branch_name}` : step.received == 1 ? `Completed Delivery` : `Wait for Completed Delivery`,
                date: step.departed_at,
                status: step.received == 0 ? 'in-progress' : 'completed'
              });
            });
          }
          else {
            this.timelineSteps.push({
              title: `Oder just placed please wait`,
              date: new Date(),
              status: 'completed'
            });
          }
        }),
        catchError(error => {
          this.alertService.error(error?.error?.message || 'Something went wrong');
          return EMPTY;
        })
      )
    );
  }

  async gatePodById(id: any) {
    const payload = { booking_id: id };
    try {
      const response = await firstValueFrom(
        this.deliveryService.podById(payload).pipe(
          tap(
            (res) => {
              if (res.body) {
                this.base64File = res.body.pod_data;
              }
            },
            (error) => {
              this.alertService.error(
                error?.error?.message || 'An error occurred while fetching PODs.'
              );
            }
          )
        )
      );
    } catch (err) {
      this.alertService.error('Failed to fetch uploaded PODs.');
    }
  }


  showImagePopup() {
    this.zoom = 1; // Reset zoom on open
    this.displayImagePopup = true;
  }
  
  onZoom(event: WheelEvent) {
    event.preventDefault();
    const delta = Math.sign(event.deltaY);
    if (delta < 0 && this.zoom < 3) {
      this.zoom += 0.1;
    } else if (delta > 0 && this.zoom > 0.5) {
      this.zoom -= 0.1;
    }
    this.zoom = parseFloat(this.zoom.toFixed(2));
  }
  
}
