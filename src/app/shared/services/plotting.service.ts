import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChartRequestDto } from '../dto/metric/ChartRequestDto';
import { GraphSerieResponse } from '../responses/plotting/GraphSerieResponse';
import { GraphRequest } from '../requests/GraphRequest';

@Injectable({
  providedIn: 'root'
})
export class PlottingService {

  private apiUrl = environment.apiUrl + '/v1/plotting';

  constructor(private http: HttpClient) {}

  getGraphSeries(graphRequest: GraphRequest): Observable<GraphSerieResponse[]>
  {
    return this.http.post<GraphSerieResponse[]>(this.apiUrl + '/getGraphSeries', graphRequest);
  }
}
