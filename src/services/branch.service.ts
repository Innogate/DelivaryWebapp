import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  constructor(private apiService: ApiService) {}

  getAllBranches(from: number = 0): Observable<any> {
    return this.apiService.post('/master/branches', { from });
  }

  getBranchById(branchId: number): Observable<any> {
    return this.apiService.post('/master/branches/byId', { branch_id: branchId });
  }

  getBranchesByCityId(cityId: number, from: number = 0): Observable<any> {
    return this.apiService.post('/master/branches/byCityId', { city_id: cityId, from });
  }

  addNewBranch(branchName: string, cityId: number, stateId: number): Observable<any> {
    return this.apiService.post('/master/branches/new', { branch_name: branchName, city_id: cityId, state_id: stateId });
  }

  deleteBranch(branchId: string): Observable<any> {
    return this.apiService.post('/master/branches/delete', { branch_id: branchId });
  }
}
