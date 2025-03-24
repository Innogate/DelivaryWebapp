import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class coloaderService {
  constructor(private apiService: ApiService) {}

  addNewColoader(data: any): Observable<any> {
    return this.apiService.post('/master/coloader/new', data);
  }
}
