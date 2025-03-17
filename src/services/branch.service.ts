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

  getBranchById(branchId: number): Observable<any> {
    return this.apiService.post('/master/branches/byId', { branch_id: branchId });
  }

  getBranchesByCityId(cityId: number, from: number = 0): Observable<any> {
    return this.apiService.post('/master/branches/byCityId', { city_id: cityId, from });
  }

  addNewBranch(data: any): Observable<any> {
    return this.apiService.post('/master/branches/new', data);
  }

  deleteBranch(branchId: string): Observable<any> {
    return this.apiService.post('/master/branches/delete', { branch_id: branchId });
  }
}
