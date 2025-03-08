import { Component } from '@angular/core';
import { GlobalStorageService } from '../services/global-storage.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {
  constructor(private storage: GlobalStorageService, private router: Router) { }
  logout(){
    this.storage.delete('token');
    this.router.navigate(['/login']);
  }
}
