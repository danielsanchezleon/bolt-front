import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertDto } from '../dto/AlertDto';
import { environment } from '../../../environments/environment';
import { AlertViewDto } from '../dto/alert/AlertViewDto';
import { HomePanelsViewDto } from '../dto/home/HomePanelsViewDto';
import { TeamViewDto } from '../dto/TeamViewDto';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private apiUrl = environment.apiUrl + '/v1/alert';

  constructor(private http: HttpClient) { }

  getHomePanels(): Observable<HomePanelsViewDto>
  {
    return this.http.get<HomePanelsViewDto>(this.apiUrl + '/getHomePanels');
  }

  getAllAlerts(filterText: string): Observable<AlertViewDto[]>
  {
    let params: HttpParams = new HttpParams();
    params = params.append('filterText', filterText);

    return this.http.get<AlertViewDto[]>(this.apiUrl + '/getAllAlerts', {params: params});
  }

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

  getAllTeams(): Observable<TeamViewDto[]>
  {
    return this.http.get<TeamViewDto[]>(this.apiUrl + '/getAllTeams');
  }

  existsByInternalName(internalName: string): Observable<boolean>
  {
    let params = new HttpParams();
    params = params.append('internalName', internalName);

    return this.http.get<boolean>(this.apiUrl + '/existsByInternalName', {params: params});
  }
}
