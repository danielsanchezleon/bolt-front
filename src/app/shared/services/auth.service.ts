import { HttpClient,HttpParams } from '@angular/common/http';
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
  private passwordApi = environment.apiUrl + '/v1/password';
  
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

  getTeam(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodePayload(token);

    if (payload.team)
      return payload.team;
    else
      return null;
  }

  getSub(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodePayload(token);

    if (payload.sub)
      return payload.sub;
    else
      return null;
  }

  getUid(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodePayload(token);

    if (payload.uid)
      return payload.uid;
    else
      return null;
  }

  requestPasswordReset(email: string) {
    const params = new HttpParams().set('email', email);
    return this.http.post<void>(`${this.passwordApi}/request`, null, { params });
  }

  validateResetToken(token: string): Observable<void> {
    const params = new HttpParams().set('token', token);
    return this.http.get<void>(`${this.passwordApi}/validate`, { params });
  }

  setPassword(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.passwordApi}/set`, { token, password });
  }
}
