import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [
    CommonModule,
    PageWrapperComponent,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    ReactiveFormsModule,
    ModalComponent
  ],
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.scss',
})
export class SetPasswordComponent {
  token: string | null = null;
  isValidating = true;
  isTokenValid = false;
  form: FormGroup;
  modalVisible = false;
  isLoading = false;
  isSuccess = false;
  isError = false;
  errorMessage = '';
  show1 = false;
  show2 = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {
    this.form = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: [this.matchPasswordsValidator()] }
    );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.isValidating = false;
      this.isTokenValid = false;
      return;
    }

    this.auth.validateResetToken(this.token).subscribe({
      next: () => {
        this.isValidating = false;
        this.isTokenValid = true;
      },
      error: () => {
        this.isValidating = false;
        this.isTokenValid = false;
      },
    });
  }

  private matchPasswordsValidator() {
    return (group: FormGroup) => {
      const pass = group.get('password')?.value;
      const confirm = group.get('confirmPassword')?.value;
      return pass && confirm && pass === confirm ? null : { mismatch: true };
    };
  }

  onClickBack() {
    this.router.navigate(['login']);
  }

  onClickGoLogin() {
    this.router.navigate(['login']);
  }

  onConfirmSetPassword() {
    if (!this.token || !this.form.valid) return;

    this.isLoading = true;
    this.isError = false;
    this.isSuccess = false;
    this.errorMessage = '';

    const pwd = this.form.get('password')?.value;

    this.auth.setPassword(this.token, pwd).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.isError = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.isError = true;
        this.errorMessage = err?.error ?? 'Error desconocido estableciendo la contraseña.';
      },
    });
  }
}
