import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  constructor(private apiService: ApiService) {}

  getAllEmployees(from: number = 0): Observable<any> {
    return this.apiService.post('/master/employees', { from });
  }

  getBranchById(branchId: number): Observable<any> {
    return this.apiService.post('/master/branches/byId', { employees_id: branchId });
  }

  getBranchesByCityId(cityId: number, from: number = 0): Observable<any> {
    return this.apiService.post('/master/employees/byBrachId', { brach_id: cityId, from });
  }

  addNewBranch(data: any): Observable<any> {
    return this.apiService.post('/master/employees/new', data);
  }

  deleteBranch(branchId: string): Observable<any> {
    return this.apiService.post('/master/employees/delete', { branch_id: branchId });
  }
}
