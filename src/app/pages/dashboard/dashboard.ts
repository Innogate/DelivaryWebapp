import { Component } from '@angular/core';
import { MenuComponent } from '../Disha/menu/menu.component';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';

@Component({
    selector: 'app-dashboard',
    standalone: true, // Required for standalone components
    imports: [MenuComponent], // Add required imports
    template: `
        <app-menu></app-menu> 
    `
})
export class Dashboard {}
