import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  constructor(private apiService: ApiService) {}

  getAllStates(from: number = 0): Observable<any> {
    return this.apiService.post('/master/states', { from });
  }

  getStateById(stateId: number): Observable<any> {
    return this.apiService.post('/master/states/byId', { state_id: stateId, from: 0 });
  }

  addNewState(stateName: string): Observable<any> {
    return this.apiService.post('/master/states/new', { state_name: stateName });
  }

  deleteState(stateId: string): Observable<any> {
    return this.apiService.post('/master/states/delete', { state_id: stateId });
  }
}
