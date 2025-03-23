
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
    // If data is not present, call the API
    try {
      const res: any = await firstValueFrom(this.pageService.getMyAccess());
      this.allowedPageIds = res.body || []; // Ensure it's an array
      this.globalstore.set('allowedPageIds', this.allowedPageIds); // Store data
      console.log("Fetched from API and stored:", this.allowedPageIds);
    } catch (error: any) {
      this.alertService.error(error.error.message);
    }
  }

  hasPageAccess(pageId: number): boolean {
    const page = this.allowedPageIds.find(page => page.page_id === pageId);
  
    if (!page || !page.permission_code || page.permission_code.length !== 5) {
      return false; // Invalid or missing permission_code
    }
  
    const [read, write, update, del, admin] = page.permission_code.split('').map(Number);
  
    // If read is 0, the user cannot see the UI for this page
    if (read === 0) {
      return false;
    }
  
    // If all permissions are 0 (00000), access is completely denied
    return write === 1 || update === 1 || del === 1 || admin === 1;
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

