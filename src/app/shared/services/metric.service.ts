import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableMetricInfo } from '../models/TableMetricInfo';
import { environment } from '../../../environments/environment';
import { ChartRequestDto } from '../dto/metric/ChartRequestDto';

@Injectable({
  providedIn: 'root'
})
export class MetricService {

  private apiUrl = environment.apiUrl + '/v1/starrocks';

  constructor(private http: HttpClient) {}

  getAllMetrics(): Observable<TableMetricInfo[]> 
  {
    return this.http.get<TableMetricInfo[]>(this.apiUrl + '/tables-metrics-info');
  }

  getMetrics(filter: string): Observable<TableMetricInfo[]> 
  {
    const params = new HttpParams().set('filter', filter);
    
    return this.http.get<TableMetricInfo[]>(this.apiUrl + '/tables-metrics-info', { params });
  }

  getMetric(metric: string, table: string): Observable<TableMetricInfo>
  {
    const params = new HttpParams().set('metric', metric).set('table', table);

    return this.http.get<TableMetricInfo>(this.apiUrl + '/getMetric', {params: params});
  }

  getChartData(chartRequestDto: ChartRequestDto): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + '/getChartData', chartRequestDto);
  }
}
