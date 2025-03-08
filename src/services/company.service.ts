import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private apiService: ApiService) {}

  getAllCompanies(from: number = 0): Observable<any> {
    return this.apiService.post('/master/companies', { from });
  }

  getCompanyById(companyId: number): Observable<any> {
    return this.apiService.post('/master/companies/byId', { company_id: companyId });
  }

  getCompaniesByState(stateId: number): Observable<any> {
    return this.apiService.post('/master/companies/byState', { state_id: stateId });
  }

  getCompaniesByCity(cityId: number): Observable<any> {
    return this.apiService.post('/master/companies/byCityId', { city_id: cityId });
  }

  addNewCompany(data: any): Observable<any> {
    return this.apiService.post('/master/companies/new', data);
  }

  deleteCompany(companyId: string): Observable<any> {
    return this.apiService.post('/master/companies/delete', { company_id: companyId });
  }
}
