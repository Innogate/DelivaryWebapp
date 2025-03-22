import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PagesService } from '../../../../../services/pages.service';
import { AlertService } from '../../../../../services/alert.service';
import { CommonModule } from '@angular/common';
import { GlobalStorageService } from '../../../../../services/global-storage.service';

@Component({
  selector: 'app-master',
  imports: [CommonModule],
  templateUrl: './master.component.html',
  styleUrl: './master.component.scss'
})
export class MasterComponent {
  constructor(
    private router: Router,
    private pageService: PagesService,
    private alertService: AlertService,
    private globalstore: GlobalStorageService
  ) { }
  selectedCard: string = ''; // Initially, no card is selected
  allowedPageIds: number[] = [];
  ngOnInit(): void {
  this.getAccess();
  }
  gotoBooking(Data: any) {
    if (Data === "booking") {
      this.router.navigate(["/Dashboard/booking"]);
    } else if (Data === "booking-status") {
      this.router.navigate(["/Dashboard/booking-status"]);
    }
  }

  async getAccess() {
    // Retrieve stored data from globalstore
    const storedAccess = this.globalstore.get('allowedPageIds');

    // Check if the stored data exists and is a valid array
    if (Array.isArray(storedAccess) && storedAccess.length > 0) {
      this.allowedPageIds = storedAccess;
      console.log("Loaded from globalstore:", this.allowedPageIds);
      return;
    }

    // If data is not present, call the API
    try {
      const res: any = await firstValueFrom(this.pageService.getMyAccess());
      this.allowedPageIds = res.body || []; // Ensure it's an array
      this.globalstore.set('allowedPageIds', this.allowedPageIds, true); // Store data
      console.log("Fetched from API and stored:", this.allowedPageIds);
    } catch (error: any) {
      this.alertService.error(error.error.message);
    }
  }



  selectCard(card: string) {
    this.selectedCard = card;
     if (card === "city") {
      this.router.navigate(["/pages/city"]);
    } else if (card === "state") {
      this.router.navigate(["/pages/state"]);
    } else if (card === "user") {
      this.router.navigate(["/pages/user"]);
    } else if (card === "employee") {
      this.router.navigate(["/pages/employee"]);
    } else if (card === "company") {
      this.router.navigate(["/pages/company"]);
    } else if (card === "branch") {
      this.router.navigate(["/pages/branch"]);
    } else if (card === "co-loader"){
      this.router.navigate(["/pages/co-loader"]);
    }  else if (card === "booking-slip") {
      this.router.navigate(["/pages/booking-slip"]);
    }
  }
}
