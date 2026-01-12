import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlarmAnalyticsService {

  private apiUrl = environment.apiUrl + '/v1/analytics';

  constructor(private http: HttpClient) { }

  getTotal(): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + '/total');
  }

  getTotalUnique(): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + '/total-unique');
  }

  getTotalCreated(): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + '/total-created');
  }

  getSeverityDist(): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + '/distribution/severity');
  }

  getTopAlerts(n: number): Observable<any>
  {
    let params = new HttpParams().set('n', n);
    return this.http.get<any>(this.apiUrl + '/ranking/alerts', { params });
  }

  getDrillDown(alertId: number, n: number): Observable<any>
  {
    let params = new HttpParams().set('n', n);
    return this.http.get<any>(this.apiUrl + `/ranking/dimensions/${alertId}`, { params });
  }

  getObDist(): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + '/distribution/business-object');
  }

  getChannelDist(): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + '/distribution/channel');
  }

  getServiceDist(): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + '/distribution/service');
  }

  getSourceDist(): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + '/distribution/source');
  }

  getGeneralMetrics(): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + '/general');
  }
}
