import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { payload } from '../../interfaces/payload.interface';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  constructor(private apiService: ApiService) {}


  getAllCities(payload: payload): Observable<any> {
    return this.apiService.post('/master/cities', payload);
  }

  getCityById(payload: payload): Observable<any> {
    return this.apiService.post('/master/cities/byId', payload);
  }

  getCitiesByStateId(payload: payload): Observable<any> {
    return this.apiService.post('/master/cities/byStateId', payload);
  }

  addNewCity(cityName: string, stateId: number): Observable<any> {
    return this.apiService.post('/master/cities/new', { city_name: cityName, state_id: stateId });
  }

  deleteCity(cityId: string): Observable<any> {
    return this.apiService.post('/master/cities/delete', { city_id: cityId });
  }
}
