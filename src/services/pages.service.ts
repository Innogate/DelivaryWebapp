import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PagesService {
  constructor(private apiService: ApiService) {}

  getAllPages(): Observable<any> {
    return this.apiService.get('/master/pages', {  });
  }

  getMypages(from: number = 0): Observable<any> {
    return this.apiService.post('/master/companies', { from });
  }
  getUserAccess(user_id:any):Observable<any>{
    return this.apiService.post('/master/access/userId', { user_id });
  }

  updateAccess(user_id:any, permission_code:any, page_id:any): Observable<any> {
    return this.apiService.post('/master/access/update', { user_id, permission_code, page_id });
  }

  getMyAccess(){
    return this.apiService.post('/master/access', {  });
  }

}
