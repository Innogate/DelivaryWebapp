import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Empty } from './empty/empty';
import { BookingComponent } from './Disha/menu/booking/booking.component';
import { StateComponent } from './Disha/menu/state/state.component';
import { CityComponent } from './Disha/menu/city/city.component';
import { BookingStatusComponent } from './Disha/menu/booking-status/booking-status.component';
import { UserComponent } from './Disha/menu/user/user.component';
import { EmployComponent } from './Disha/menu/employ/employ.component';
import { CompanyComponent } from './Disha/menu/company/company.component';
import { BranchComponent } from './Disha/menu/branch/branch.component';
import { MenuComponent } from './Disha/menu/menu.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'scan', component: MenuComponent },
    { path: 'empty', component: Empty },
    {path: 'booking', component: BookingComponent },
    {path: 'state', component: StateComponent},
    {path: 'city', component: CityComponent},
    {path: 'booking-status', component: BookingStatusComponent},
    {path: 'employee', component: EmployComponent},
    {path: 'user', component: UserComponent},
    {path: 'company', component: CompanyComponent},
    {path: 'branch', component: BranchComponent},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
