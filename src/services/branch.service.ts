import { payload } from './../../interfaces/payload.interface';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  constructor(private apiService: ApiService) {}

  getAllBranches(payload:any): Observable<any> {
    return this.apiService.post('/master/branches', payload);
  }

  getBranchById(payload: any): Observable<any> {
    return this.apiService.post('/master/branches/byId', payload);
  }

  getBranchesByCityId(payload: any): Observable<any> {
    return this.apiService.post('/master/branches/byCityId', payload);
  }

  addNewBranch(payload: any): Observable<any> {
    return this.apiService.post('/master/branches/new', payload);
  }

  deleteBranch(payload: any): Observable<any> {
    return this.apiService.post('/master/branches/delete', payload);
  }
}
