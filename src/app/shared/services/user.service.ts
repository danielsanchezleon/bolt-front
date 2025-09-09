import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserViewDto } from '../dto/user/UserViewDto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl + '/v1/user';

  constructor(private http: HttpClient) {}

  getUsers(
    page: number,
    size: number,
    filterText: string | null
  ): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.append('page', page).append('size', size);

    if (filterText != null) {
      params = params.append('filterText', filterText);
    }

    return this.http.get<any>(this.apiUrl + '/getUsers', { params: params });
  }
}
