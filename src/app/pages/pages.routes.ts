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
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { CoLoaderComponent } from './Disha/menu/co-loader/co-loader.component';
import { ManifestComponent } from './Disha/menu/manifest/manifest.component';
import { BookingSlipComponent } from './Disha/menu/booking-slip/booking-slip.component';
export default [
    {path: 'documentation', component: Documentation },
    {path: 'scan', component: MenuComponent },
    {path: 'login', component: LoginComponent },
    {path: 'empty', component: Empty },
    {path: 'booking', component: BookingComponent, canActivate: [AuthGuard]},
    {path: 'state', component: StateComponent, canActivate: [AuthGuard]},
    {path: 'city', component: CityComponent, canActivate: [AuthGuard]},
    {path: 'booking-status', component: BookingStatusComponent, canActivate: [AuthGuard]},
    {path: 'employee', component: EmployComponent, canActivate: [AuthGuard]},
    {path: 'user', component: UserComponent, canActivate: [AuthGuard]},
    {path: 'company', component: CompanyComponent, canActivate: [AuthGuard]},
    {path: 'co-loader', component: CoLoaderComponent, canActivate: [AuthGuard]},
    {path: 'manifest', component: ManifestComponent, canActivate: [AuthGuard]},
    {path: 'booking-slip', component: BookingSlipComponent, canActivate: [AuthGuard]},
    {path: 'branch', component: BranchComponent},
    {path: '**', redirectTo: '/notfound' }
] as Routes;
