import { payload } from './../../interfaces/payload.interface';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  constructor(private apiService: ApiService) {}

  getAllEmployees(payload: any): Observable<any> {
    return this.apiService.post('/master/employees', payload);
  }

  getAllEmployeesNotExist(payload: any): Observable<any> {
    return this.apiService.post('/master/employees/notExist', payload);
  }

  getAllEmployeesById(payload: any): Observable<any> {
    return this.apiService.post('/master/branches/byId', payload);
  }

  getAllEmployeesByBranchId(payload:any): Observable<any>{
    return this.apiService.post('/master/employees/byBranchId', payload);
  }

  getBranchesByCityId(cityId: number, from: number = 0): Observable<any> {
    return this.apiService.post('/master/employees/byBrachId', { brach_id: cityId, from });
  }

  addNewEmployee(data: any): Observable<any> {
    return this.apiService.post('/master/employees/new', data);
  }

  updateEmployee(payload: any): Observable<any> {
    return this.apiService.post('/master/employees/update', payload);
  }

  deleteEmployee(employee_id: string): Observable<any> {
    return this.apiService.post('/master/employees/delete', { employee_id: employee_id });
  }

  employeeInfo(): Observable<any> {
  return this.apiService.post('/master/employees/myInfo', {});
  }
}
