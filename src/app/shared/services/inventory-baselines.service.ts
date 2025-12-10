import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaselineResponse } from '../responses/baselines/BaselineResponse';
import { DimensionValuesRequest } from '../requests/baseline/DimensionValuesRequest';

@Injectable({
  providedIn: 'root'
})
export class InventoryBaselinesService {

  private apiUrl = environment.apiUrl + '/v1/inventory-baselines';

  constructor(private http: HttpClient) {}

  getBaselines(type: string): Observable<BaselineResponse[]> 
  {
    const params = new HttpParams().set('type', type);

    return this.http.get<BaselineResponse[]>(this.apiUrl + '/getBaselines', {params: params});
  }

  getBaselineGroupByOptions(type: string): Observable<string[]> 
  {
    const params = new HttpParams().set('type', type);
    
    return this.http.get<string[]>(this.apiUrl + '/getBaselineGroupByOptions', {params: params});
  }

  getDimensionValues(dimensionValuesRequest: DimensionValuesRequest): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + '/getDimensionValues', dimensionValuesRequest);
  }
}
