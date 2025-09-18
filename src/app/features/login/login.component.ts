import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators,FormControl } from '@angular/forms';
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

  showForgot = false;
  resetEmail = new FormControl('', [Validators.required, Validators.email, Validators.maxLength(255)]);
  isResetLoading = false;
  resetSent = false;
  resetError = ''; 

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

  toggleForgot() {
    this.showForgot = !this.showForgot;
    this.resetError = '';
    if (!this.showForgot) {
      this.resetEmail.enable();
      this.resetEmail.reset();
      this.resetSent = false;
      this.isResetLoading = false;
    }
  }

  sendReset() {
    if (this.resetEmail.invalid || this.isResetLoading) return;

    this.isResetLoading = true;
    this.resetError = '';
    this.resetSent = false;

    this.authService.requestPasswordReset(this.resetEmail.value!).subscribe({
      next: () => {
        this.isResetLoading = false;
        this.resetSent = true; // bloquea el botón por HTML
        this.resetEmail.disable(); 
      },
      error: () => {
        this.isResetLoading = false;
        this.resetSent = true;
      },
    });
  }
}
