import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { UserService } from '../../shared/services/user.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageWrapperComponent,
    ModalComponent,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss',
})
export class CreateUserComponent {
  userForm: FormGroup;

  teamOptions: { label: string; value: number }[] = [];
  roleOptions: { label: string; value: number }[] = [];
  isLoadingTeams = false;
  isLoadingRoles = false;

  modalVisible = false;
  isLoading = false;
  isSuccess = false;
  isError = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private http: HttpClient,
    private auth: AuthService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(64)]],
      lastName: ['', [Validators.required, Validators.maxLength(64)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(255)],
      ],
      teamId: [null, [Validators.required]],
      roleId: [null, [Validators.required]],
    });
  }

  get isAdmin(): boolean {
    return this.auth.getRoles()?.includes('ADMIN') ?? false;
  }

  get myTeamId(): number | null {
    return this.auth.getTeam() ?? null;
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.userForm.get('teamId')?.disable();
    }
    this.loadTeams();
    this.loadRoles();
  }

  onClickNavigateToUsers() {
    this.router.navigate(['usuarios']);
  }

  private loadTeams() {
    this.isLoadingTeams = true;
    this.http.get<any[]>(`${environment.apiUrl}/v1/team/getTeams`).subscribe({
      next: (teams) => {
        let visibles = teams || [];

        // Si es manager, sólo su equipo
        if (!this.isAdmin && this.myTeamId != null) {
          visibles = visibles.filter((t) => t.id === this.myTeamId);
        }

        this.teamOptions = visibles.map((t) => ({
          label: t.name,
          value: t.id,
        }));

        if (!this.isAdmin && this.teamOptions.length === 1) {
          this.userForm.patchValue({ teamId: this.teamOptions[0].value });
        }

        this.isLoadingTeams = false;
      },
      error: () => {
        this.isLoadingTeams = false;
      },
    });
  }

  private loadRoles() {
    this.isLoadingRoles = true;
    this.http.get<any[]>(`${environment.apiUrl}/v1/role/getRoles`).subscribe({
      next: (roles) => {
        const myRoles = this.auth.getRoles() || [];
        const isAdmin = myRoles.includes('ADMIN');
        const filtered = (roles || []).filter(
          (r) => isAdmin || r.name !== 'ADMIN'
        );
        this.roleOptions = filtered.map((r) => ({
          label: r.name,
          value: r.id,
        }));
        this.isLoadingRoles = false;
      },
      error: () => {
        this.isLoadingRoles = false;
      },
    });
  }

  openConfirmModal() {
    this.modalVisible = true;
    this.isLoading = false;
    this.isSuccess = false;
    this.isError = false;
    this.errorMessage = '';
  }

  onConfirmCreateUser() {
    if (this.userForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;
    this.errorMessage = '';

    const raw = this.userForm.getRawValue();

    const payload = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      teamId: raw.teamId,
      roleId: raw.roleId,
    };

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.isError = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.isError = true;
        this.errorMessage = err?.error || 'Error inesperado';
      },
    });
  }

  closeModalAndReset() {
    this.modalVisible = false;
    this.isLoading = false;
    this.isSuccess = false;
    this.isError = false;
    this.errorMessage = '';
    this.userForm.reset();
  }

  usernamePreview(): string {
    const first = (this.userForm.value.firstName || '').toString();
    const last = (this.userForm.value.lastName || '').toString();

    const norm = (s: string) =>
      s
        .normalize('NFD') 
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ') 
        .trim()
        .replace(/\s+/g, '.');

    const left = norm(first);
    const right = norm(last);
    if (!left && !right) return '';
    if (!left) return right;
    if (!right) return left;
    return `${left}.${right}`;
  }
}