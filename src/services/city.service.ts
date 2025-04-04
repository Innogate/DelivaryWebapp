import { payload } from './../../interfaces/payload.interface';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  constructor(private apiService: ApiService) {}


  getAllCities(payload: payload): Observable<any> {
    return this.apiService.post('/master/cities', payload);
  }

  getCityById(payload: any): Observable<any> {
    return this.apiService.post('/master/cities/byId', payload);
  }

  getCitiesByStateId(payload: any): Observable<any> {
    return this.apiService.post('/master/cities/byStateId', payload);
  }

  addNewCity(payload: any): Observable<any> {
    return this.apiService.post('/master/cities/new', payload);
  }

  deleteCity(payload: any): Observable<any> {
    return this.apiService.post('/master/cities/delete', payload);
  }
}
