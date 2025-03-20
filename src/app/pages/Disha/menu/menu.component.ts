
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PagesService } from '../../../../services/pages.service';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  constructor(
    private router: Router,
    private pageService: PagesService,
    private alertService: AlertService
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
    try {
      const res:any = await firstValueFrom(this.pageService.getMyAccess());
      this.allowedPageIds = res.body;
      console.log(this.allowedPageIds);
    } catch (error: any) {
      this.alertService.error(error.error.message);
    }
  }


  hasPageAccess(pageId: number): boolean {
    return this.allowedPageIds.includes(pageId);
  }



  selectCard(card: string) {
    this.selectedCard = card;
    if (card === "booking") {
      this.router.navigate(["/pages/booking"]);
    } else if (card === "booking-status") {
      this.router.navigate(["/pages/booking-status"]);
    } else if (card === "city") {
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
    } else if (card === "manifest") {
    this.router.navigate(["/pages/manifest"]);
    } else if (card === "booking-slip") {
      this.router.navigate(["/pages/booking-slip"]);
    }
  }
  
}

