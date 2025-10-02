import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertDto } from '../dto/AlertDto';
import { environment } from '../../../environments/environment';
import { AlertViewDto } from '../dto/alert/AlertViewDto';
import { HomePanelsViewDto } from '../dto/home/HomePanelsViewDto';
import { TeamViewDto } from '../dto/TeamViewDto';
import { TableViewDto } from '../dto/table/TableViewDto';

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

  getAlert(alertId: number): Observable<AlertViewDto>
  {
    let params: HttpParams = new HttpParams();
    params = params.append('alertId', alertId);

    return this.http.get<AlertViewDto>(this.apiUrl + '/getAlert', {params: params});
  }

  getAllAlerts(page: number, size: number, filterText: string | null, alertId: number | null): Observable<any>
  {
    let params: HttpParams = new HttpParams();

    params = params.append('page', page).append('size', size);

    if (filterText != null)
    {
      params = params.append('filterText', filterText);
    }

    if (alertId != null)
    {
      params = params.append('alertId', alertId);
    }

    return this.http.get<any>(this.apiUrl + '/getAllAlerts', {params: params});
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

  updateAlert(alertViewDto: AlertViewDto): Observable<AlertViewDto>
  {
    return this.http.put<AlertViewDto>(this.apiUrl + '/updateAlert', alertViewDto);
  }

  crupdateAlert(alertId: number | null, alertDto: AlertDto): Observable<any>
  {
    let params = new HttpParams();

    if (alertId != null)
      params = params.append('alertId', alertId);

    return this.http.put<any>(this.apiUrl + '/crupdateAlert', alertDto, {params: params});
  }

  getUserAlertsTable(page: number, size: number, filterText: string | null): Observable<TableViewDto>
  {
    let params: HttpParams = new HttpParams();

    params = params.append('page', page).append('size', size);

    if (filterText != null)
    {
      params = params.append('filterText', filterText);
    }

    return this.http.get<TableViewDto>(this.apiUrl + '/getUserAlertsTable', {params: params});
  }

  getUserAlertList(page: number, size: number, filterText: string | null): Observable<any>
  {
    let params: HttpParams = new HttpParams();

    params = params.append('page', page).append('size', size);

    if (filterText != null)
    {
      params = params.append('filterText', filterText);
    }

    return this.http.get<any>(this.apiUrl + '/getUserAlertList', {params: params});
  }

  getTeamAlertList(page: number, size: number, filterText: string | null): Observable<any>
  {
    let params: HttpParams = new HttpParams();

    params = params.append('page', page).append('size', size);

    if (filterText != null)
    {
      params = params.append('filterText', filterText);
    }

    return this.http.get<any>(this.apiUrl + '/getTeamAlertList', {params: params});
  }

  deleteAlert(alertId: number): Observable<any>
  {
    let params: HttpParams = new HttpParams();

    params = params.append('alertId', alertId);

    return this.http.delete<any>(this.apiUrl + '/deleteAlert', {params: params});
  }
}
