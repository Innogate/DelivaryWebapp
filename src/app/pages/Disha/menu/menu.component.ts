
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PagesService } from '../../../../services/pages.service';
import { AlertService } from '../../../../services/alert.service';
import { GlobalStorageService } from '../../../../services/global-storage.service';

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
    private alertService: AlertService,
    private globalstore: GlobalStorageService
  ) { }
  selectedCard: string = ''; // Initially, no card is selected
  allowedPageIds: any[] = [];
  bookingPage: boolean = false;
  bookingStatusPages: boolean = false;
  masterPage: boolean = false;
  manifest: boolean = false;
  ngOnInit(): void {
    this.getAccess();
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

  hasPageAccess(pageId: number): boolean {
    return this.allowedPageIds.some(page => page.page_id === pageId);
  }
  selectCard(card: string) {
    this.selectedCard = card;
    if (card === "booking") {
      this.router.navigate(["/pages/booking"]);
    } else if (card === "booking-status") {
      this.router.navigate(["/pages/booking-status"]);
    } else if (card === "master") {
      this.router.navigate(["/pages/master"]);
    } else if (card === "manifest") {
      this.router.navigate(["/pages/manifest"]);
    }
  }
}

