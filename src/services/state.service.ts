import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { payload } from '../../interfaces/payload.interface';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  constructor(private apiService: ApiService) {}

  getAllStates(payload: payload): Observable<any> {
    return this.apiService.post('/master/states',  payload);
  }

  getStateById(payload: payload): Observable<any> {
    return this.apiService.post('/master/states/byId', payload);
  }

  addNewState(stateName: string): Observable<any> {
    return this.apiService.post('/master/states/new', { state_name: stateName });
  }

  deleteState(stateId: string): Observable<any> {
    return this.apiService.post('/master/states/delete', { state_id: stateId });
  }
}
