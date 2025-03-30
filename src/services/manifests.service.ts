import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GlobalStorageService } from './global-storage.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ManifestsService {
  constructor(
    private apiService: ApiService,
  ) {}


  gateAllBookings() {
    return this.apiService.post('/manifests/bookings', { });
  }

   generateManifest(payload: any): Observable<any> {
        return this.apiService.post('/manifests/new', payload);
  }

  getManifest(payload: any): Observable<any> {
    return this.apiService.post('/manifests', payload);
  }

  getManifestById(payload: any): Observable<any> {
    return this.apiService.post('/manifests/byId', payload);
  }

}