import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableMetricInfo } from '../models/TableMetricInfo';
import { AlertDto } from '../dto/AlertDto';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private apiUrl = 'http://localhost:8081/api/v1/alert';

  constructor(private http: HttpClient) { }

  createSimpleAlert(alertDto: AlertDto): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + '/createSimpleAlert', alertDto);
  }

  getDimensionValues(bbdd: string, table_name: string, metric: string, dimension: string): Observable<any>
  {
    let params = new HttpParams();
    params = params.append('bbdd', bbdd).append('table_name', table_name).append('metric', metric).append('dimension', dimension);

    return this.http.get<any>(this.apiUrl + '/getDimensionValues', {params: params});
  }
}
