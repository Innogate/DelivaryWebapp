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
  allowedPageIds: any[] = [];  ngOnInit(): void {
  this.getAccess();
  }

  async getAccess() {
    try {
      const res: any = await firstValueFrom(this.pageService.getMyAccess());
      this.allowedPageIds = res.body || []; // Ensure it's an array
      this.globalstore.set('allowedPageIds', this.allowedPageIds); // Store data
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
    const routes: { [key: string]: string } = {
      city: '/pages/city',
      state: '/pages/state',
      user: '/pages/user',
      employee: '/pages/employee',
      company: '/pages/company',
      branch: '/pages/branch',
      'co-loader': '/pages/co-loader',
      'booking-slip': '/pages/booking-slip'
    };

    if (routes[card]) {
      this.router.navigate([routes[card]]);
    }
  }
}
