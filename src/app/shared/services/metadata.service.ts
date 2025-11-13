import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  private apiUrl = environment.apiUrl + '/v1/metadata';

  constructor(private http: HttpClient) {}

  getServices(): Observable<string[]> 
  {
    return this.http.get<string[]>(this.apiUrl + '/services');
  }

  getSources(): Observable<string[]> 
  {    
    return this.http.get<string[]>(this.apiUrl + '/sources');
  }

  getDataTypes(): Observable<string[]>
  {
    return this.http.get<string[]>(this.apiUrl + '/data-types');
  }

  getCategories(): Observable<string[]>
  {
    return this.http.get<string[]>(this.apiUrl + '/categories');
  }
}
