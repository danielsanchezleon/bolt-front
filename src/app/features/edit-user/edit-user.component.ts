import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { UserUpdateDto } from '../../shared/dto/user/UserUpdateDto';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-edit-user',
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
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent {
  userId!: number;

  userForm: FormGroup;

  teamOptions: { label: string; value: number }[] = [];
  roleOptions: { label: string; value: number }[] = [];
  isLoadingTeams = false;
  isLoadingRoles = false;

  isLoadingData = true;

  modalVisible = false;
  isSaving = false;
  isSuccess = false;
  isError = false;
  errorMessage = '';

  get isAdmin(): boolean {
    return this.auth.getRoles()?.includes('ADMIN') ?? false;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private http: HttpClient,
    private auth: AuthService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(64)]],
      lastName:  ['', [Validators.required, Validators.maxLength(64)]],
      email:     ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      teamId:    [null, [Validators.required]],
      roleId:    [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.isAdmin) {
      this.userForm.get('teamId')?.disable();
    }

    this.loadTeams();
    this.loadRoles();
    this.loadUser();
  }

  onClickNavigateToUsers() {
    this.router.navigate(['usuarios']);
  }

  private loadTeams() {
    this.isLoadingTeams = true;
    this.http.get<any[]>(`${environment.apiUrl}/v1/team/getTeams`).subscribe({
      next: (teams) => {
        this.teamOptions = (teams || []).map(t => ({ label: t.name, value: t.id }));
        this.isLoadingTeams = false;
      },
      error: () => { this.isLoadingTeams = false; }
    });
  }

  private loadRoles() {
    this.isLoadingRoles = true;
    this.http.get<any[]>(`${environment.apiUrl}/v1/role/getRoles`).subscribe({
      next: (roles) => {
        const filtered = this.isAdmin ? (roles || []) : (roles || []).filter(r => r.name !== 'ADMIN');
        this.roleOptions = filtered.map(r => ({ label: r.name, value: r.id }));
        this.isLoadingRoles = false;
      },
      error: () => { this.isLoadingRoles = false; }
    });
  }

  private loadUser() {
    this.isLoadingData = true;
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        // Espera: { id, firstName, lastName, email, teamId, roleId }
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName:  user.lastName,
          email:     user.email,
          teamId:    user.teamId ?? null,
          roleId:    user.roleId ?? null,
        });
        this.isLoadingData = false;
      },
      error: () => {
        this.isLoadingData = false;
        this.errorMessage = 'No se pudo cargar el usuario.';
      },
    });
  }

  openConfirmModal() {
    if (this.userForm.invalid) return;
    this.modalVisible = true;
    this.isSaving = false;
    this.isSuccess = false;
    this.isError = false;
    this.errorMessage = '';
  }

  onConfirmSave() {
    if (this.userForm.invalid || this.isSaving) return;

    this.isSaving = true;
    this.isSuccess = false;
    this.isError = false;
    this.errorMessage = '';

    // recoger también valores disabled (teamId si no eres admin)
    const raw = this.userForm.getRawValue();

    const payload: UserUpdateDto = {
      id: this.userId,
      firstName: raw.firstName,
      lastName:  raw.lastName,
      email:     raw.email,
      teamId:    raw.teamId,
      roleId:    raw.roleId,
    };

    this.userService.updateUser(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.isSuccess = true;
        this.isError = false;
      },
      error: (err) => {
        this.isSaving = false;
        this.isSuccess = false;
        this.isError = true;
        this.errorMessage = err?.error || 'Error inesperado';
      },
    });
  }
}