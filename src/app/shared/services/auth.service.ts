import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../dto/auth/LoginRequest';
import { TokenResponse } from '../dto/auth/TokenResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl + '/v1/auth';
  
  constructor(private http: HttpClient) {}

  login(loginRequest: LoginRequest): Observable<TokenResponse> 
  {
    return this.http.post<TokenResponse>(this.apiUrl + '/login', loginRequest);
  }

  logout()
  {
    sessionStorage.removeItem('token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  private decodePayload(token: string): any 
  {
    try 
    {
      const base64 = token.split('.')[1];
      return JSON.parse(atob(base64));
    } 
    catch (e) 
    {
      return null;
    }
  }

  isAuthenticated(): boolean 
  {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.decodePayload(token);
    return payload && Date.now() < payload.exp * 1000; // exp en segundos → convertir a ms
  }

  getRoles(): string[] | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodePayload(token);

    if (payload.roles)
      return payload.roles.split(',').map((role: string) => role.trim()).filter((role: string) => role.length > 0);
    else
      return null;
  }
}
