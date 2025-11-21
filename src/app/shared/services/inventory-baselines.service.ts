import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaselineResponse } from '../responses/baselines/BaselineResponse';

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
}
