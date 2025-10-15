import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertOcurrencesService {

  private apiUrl = environment.apiUrl + '/v1/alert-occurrences';

  constructor(private http: HttpClient) { }

  getDistinctDataTypes(): Observable<string[]>
  {
    return this.http.get<string[]>(this.apiUrl + '/data-types');
  }

  getDistinctTableNamesByDataType(dataType: string): Observable<string[]>
  {
    return this.http.get<string[]>(this.apiUrl + '/data-types/' + dataType + '/tables');
  }

  getDistinctMetricsByDataTypeAndTable(dataType: string, tableName: string): Observable<string[]>
  {
    return this.http.get<string[]>(this.apiUrl + '/data-types/' + dataType + '/tables/' + tableName + '/metrics');
  }

  getDistinctDimensionsByDataTypeTableAndMetric(dataType: string, tableName: string, metric: string): Observable<string[]>
  {
    return this.http.get<string[]>(this.apiUrl + '/data-types/' + dataType + '/tables/' + tableName + '/metrics/' + metric + '/dimensions');
  }
}
