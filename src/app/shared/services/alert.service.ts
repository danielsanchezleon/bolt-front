import { HttpClient } from '@angular/common/http';
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

  createAlert(alertDto: AlertDto): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + '/createAlert', alertDto);
  }
}
