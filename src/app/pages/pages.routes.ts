import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Empty } from './empty/empty';
import { BookingComponent } from './Disha/menu/booking/booking.component';
import { CityComponent } from './Disha/menu/master/city/city.component';
import { BookingStatusComponent } from './Disha/menu/booking-status/booking-status.component';
import { UserComponent } from './Disha/menu/master/user/user.component';
import { CompanyComponent } from './Disha/menu/company/company.component';
import { BranchComponent } from './Disha/menu/master/branch/branch.component';
import { MenuComponent } from './Disha/menu/menu.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { CoLoaderComponent } from './Disha/menu/master/co-loader/co-loader.component';
import { ManifestComponent } from './Disha/menu/manifest/manifest.component';
import { Access } from './auth/access';
import { AccessComponent } from './Disha/access/access.component';
import { StateComponent } from './Disha/menu/master/state/state.component';
import { EmployComponent } from './Disha/menu/master/employ/employ.component';
import { BookingSlipComponent } from './Disha/menu/master/booking-slip/booking-slip.component';
import { MasterComponent } from './Disha/menu/master/master.component';
import { BookingResiveComponent } from './Disha/menu/booking-resive/booking-resive.component';
import { DeliveryComponent } from './Disha/menu/delivery/delivery.component';
import { PodUploadComponent } from './Disha/menu/pod-upload/pod-upload.component';
import { ViewpodComponent } from './Disha/menu/viewpod/viewpod.component';
export default [
    {path: 'documentation', component: Documentation },
    {path: 'scan', component: MenuComponent },
    {path: 'login', component: LoginComponent },
    {path: 'empty', component: Empty },
    {path: 'booking', component: BookingComponent, canActivate: [AuthGuard]},
    {path: 'state', component: StateComponent, canActivate: [AuthGuard]},
    {path: 'city', component: CityComponent, canActivate: [AuthGuard]},
    {path: 'booking-status', component: BookingStatusComponent, canActivate: [AuthGuard]},
    {path: 'booking-Received', component: BookingResiveComponent, canActivate: [AuthGuard]},
    {path: 'employee', component: EmployComponent, canActivate: [AuthGuard]},
    {path: 'user', component: UserComponent, canActivate: [AuthGuard]},
    {path: 'company', component: CompanyComponent, canActivate: [AuthGuard]},
    {path: 'co-loader', component: CoLoaderComponent, canActivate: [AuthGuard]},
    {path: 'manifest', component: ManifestComponent, canActivate: [AuthGuard]},
    {path: 'delivery', component: DeliveryComponent, canActivate: [AuthGuard]},
    {path: 'pod-upload', component: PodUploadComponent, canActivate: [AuthGuard]},
    {path: 'booking-slip', component: BookingSlipComponent, canActivate: [AuthGuard]},
    {path: 'branch', component: BranchComponent, canActivate: [AuthGuard]},
    {path: 'master', component: MasterComponent, canActivate: [AuthGuard]},
    { path: 'viewpod/:id', component: ViewpodComponent, canActivate: [AuthGuard] },
    {path: 'access/:userId', component: AccessComponent},
    {path: '**', redirectTo: '/notfound' }
] as Routes;
