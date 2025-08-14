import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EndpointViewDto } from '../dto/endpoint/EndpointViewDto';
import { EndpointDto } from '../dto/endpoint/EndpointDto';

@Injectable({
  providedIn: 'root'
})
export class EndpointService {

  private apiUrl = environment.apiUrl + '/v1/endpoint';

  constructor(private http: HttpClient) { }

  createEndpoint(endpointDto: EndpointDto): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + '/createEndpoint', endpointDto);
  }

  getEndpoints(page: number, size: number, filterText: string | null): any
  {
    let params: HttpParams = new HttpParams();

    params = params.append('page', page).append('size', size)

    if (filterText != null)
      params = params.append('filterText', filterText);

    return this.http.get<any>(this.apiUrl + '/getEndpoints', {params: params});
  }

  getEndpointsByType(): any
  {
    return this.http.get<any>(this.apiUrl + '/getEndpointsByType');
  }

  deleteEndpoint(id: number): Observable<any>
  {
    let params: HttpParams = new HttpParams();
    params = params.append('id', id);

    return this.http.delete<any>(this.apiUrl + '/deleteEndpoint', {params: params})
  }
}
