import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { BookingComponent } from './Disha/menu/booking/booking.component';
import { StateComponent } from './Disha/menu/state/state.component';
import { CityComponent } from './Disha/menu/city/city.component';
import { BookingStatusComponent } from './Disha/menu/booking-status/booking-status.component';
import { UserComponent } from './Disha/menu/user/user.component';
import { EmployComponent } from './Disha/menu/employ/employ.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    {path: 'booking', component: BookingComponent },
    {path: 'state', component: StateComponent},
    {path: 'city', component: CityComponent},
    {path: 'booking-status', component: BookingStatusComponent},
    {path: 'employee', component: EmployComponent},
    {path: 'user', component: UserComponent},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
