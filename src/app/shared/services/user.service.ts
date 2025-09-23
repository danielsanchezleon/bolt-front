import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserViewDto } from '../dto/user/UserViewDto';
import { UserUpdateDto } from '../dto/user/UserUpdateDto';
import { UserCreateDto } from '../dto/user/UserCreateDto';

export interface UserEditDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  teamId: number | null;
  roleId: number | null;
}

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

    return this.http.get<any>(this.apiUrl + '/getUsers', { params });
  }

  deleteUser(id: number): Observable<any> {
    const params = new HttpParams().append('id', id);
    return this.http.delete<any>(this.apiUrl + '/deleteUser', { params });
  }

  createUser(user: UserCreateDto): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/createUser', user);
  }

  getUser(id: number): Observable<UserEditDto> {
    return this.http.get<UserEditDto>(`${this.apiUrl}/getUser`, {
      params: { id },
    });
  }

  updateUser(dto: UserUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/updateUser`, dto);
  }
}