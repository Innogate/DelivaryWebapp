import { Routes } from '@angular/router';
import { Access } from './access';
import { Error } from './error';
import { AuthGuard } from './auth.guard';

export default [
    { path: 'access', component: Access, canActivate: [AuthGuard] },
    { path: 'error', component: Error },
] as Routes;
