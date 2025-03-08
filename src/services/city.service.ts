import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  constructor(private apiService: ApiService) {}

  getAllCities(from: number = 0): Observable<any> {
    return this.apiService.post('/master/cities', { from });
  }

  getCityById(cityId: number): Observable<any> {
    return this.apiService.post('/master/cities/byId', { city_id: cityId });
  }

  getCitiesByStateId(stateId: number, from: number = 0): Observable<any> {
    return this.apiService.post('/master/cities/byStateId', { state_id: stateId, from });
  }

  addNewCity(cityName: string, stateId: number): Observable<any> {
    return this.apiService.post('/master/cities/new', { city_name: cityName, state_id: stateId });
  }

  deleteCity(cityId: string): Observable<any> {
    return this.apiService.post('/master/cities/delete', { city_id: cityId });
  }
}
