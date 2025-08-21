import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { LoginRequest } from '../../shared/dto/auth/LoginRequest';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FloatLabelModule, InputTextModule, ButtonModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent 
{
  loginForm: FormGroup;
  @ViewChild('usernameOrEmailInput') usernameOrEmailInput!: ElementRef;

  isLoading: boolean = false;
  isError: boolean = false;

  constructor(private _fb: FormBuilder, private authService: AuthService, private router: Router) 
  {
    this.loginForm = this._fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    // Coloca el foco automáticamente en el input del username
    this.usernameOrEmailInput.nativeElement.focus();
  }

  onClickRequestAccess()
  {
    if (this.loginForm.valid)
    {
      sessionStorage.removeItem('token');
      this.isLoading = true;
      this.isError = false;

      let loginRequest: LoginRequest = new LoginRequest(this.loginForm.get('usernameOrEmail')?.value, this.loginForm.get('password')?.value);

      this.authService.login(loginRequest).subscribe(
        (response: any) => {
          this.isLoading = false;
          this.isError = false;
          sessionStorage.setItem('token', response.token);
          this.router.navigate(['']);
        },
        (error: any) => {
          this.isLoading = false;
          this.isError = true;
        }
      );
    }
  }
}
