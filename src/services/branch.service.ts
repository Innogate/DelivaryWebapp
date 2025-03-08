import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  constructor(private apiService: ApiService) {}

  getBranches(from: number = 0): Observable<any> {
    return this.apiService.post('/master/branches', { from });
  }

  getBranchById(branchId: number): Observable<any> {
    return this.apiService.post('/master/branches', { brach_id: branchId });
  }

  createNewBranch(data: any): Observable<any> {
    return this.apiService.post('/master/branches/new', data);
  }

  deleteBranch(branchId: string): Observable<any> {
    return this.apiService.post('/master/branches/delete', { branch_id: branchId });
  }
}
