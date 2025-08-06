import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableMetricInfo } from '../models/TableMetricInfo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetricService {

  private apiUrl = environment.apiUrl + '/v1/starrocks/tables-metrics-info';

  constructor(private http: HttpClient) {}

  getAllMetrics(): Observable<TableMetricInfo[]> 
  {
    return this.http.get<TableMetricInfo[]>(this.apiUrl);
  }

  getMetrics(filter: string): Observable<TableMetricInfo[]> 
  {
    const params = new HttpParams().set('filter', filter);
    
    return this.http.get<TableMetricInfo[]>(this.apiUrl, { params });
  }
}
