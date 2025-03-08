import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalStorageService } from './global-storage.service';
import apiUrl from '../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = apiUrl.apiUrl; // Assuming this is set in an environment variable or config file

  constructor(private http: HttpClient, private storage: GlobalStorageService) {}

  // Helper function to set up headers with Authorization token
  private getHeaders(): HttpHeaders {
    const token = this.storage.get('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Generic GET request
  get<T>(url: string, params: any = {}): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${url}`, { headers: this.getHeaders(), params });
  }

  // Generic POST request
  post<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${url}`, data, { headers: this.getHeaders() });
  }

  // Generic DELETE request
  delete<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${url}`, data, { headers: this.getHeaders() });
  }
}
