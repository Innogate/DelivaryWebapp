import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StepsModule } from 'primeng/steps';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { catchError, EMPTY, firstValueFrom, tap } from 'rxjs';
import { TrakingService } from '../../../../../services/traking.service';
import { AlertService } from '../../../../../services/alert.service';
import { ActivatedRoute, Route } from '@angular/router';
import { TimelineModule } from 'primeng/timeline';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@Component({
  selector: 'app-tracking',
  imports: [CommonModule, StepsModule, StepperModule, ButtonModule, TimelineModule],
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.scss'
})
export class TrackingComponent implements OnInit {
  slipNo: string = '';
  booking: any = {};
  timelineSteps: any[] = [];
  response: any;

  constructor(
    private route: ActivatedRoute,
    private trakingService: TrakingService, // replace with actual service type
    private alertService: AlertService     // replace with actual service type
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    this.slipNo = id || '';

    await this.trakingBookings();

    const statusList = this.response.body.status;
    this.booking = this.response.body.booking;

    // Initial booking step
    this.timelineSteps.push({
      title: `Package Booked at ${statusList[0].source_branch_name}`,
      date: this.booking.booking_date,
      status: 'completed',
    });

    // Loop through tracking steps
    statusList.forEach((step: any, index: number) => {
      this.timelineSteps.push({
        title: `Departed from ${step.source_branch_name}`,
        date: step.departed_at,
        status: 'completed',
      });

      this.timelineSteps.push({
        title: `Arrived at ${step.destination_branch_name}`,
        date: step.arrived_at,
        status: index === statusList.length - 1 ? 'in-progress' : 'completed',
      });
    });

    // Final pending delivery
    this.timelineSteps.push({
      title: 'Delivered to Consignee',
      date: null,
      status: 'pending',
    });
  }

  async trakingBookings(): Promise<void> {
    const payload = { slip_no: this.slipNo };

    await firstValueFrom(
      this.trakingService.trakingBooking(payload).pipe(
        tap(response => {
          // this.alertService.success(?response.message || 'Success');
          this.response = response;
        }),
        catchError(error => {
          this.alertService.error(error?.error?.message || 'Something went wrong');
          return EMPTY;
        })
      )
    );
  }

}
