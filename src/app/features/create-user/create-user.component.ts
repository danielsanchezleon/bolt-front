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
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(64)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      teamId: [null, [Validators.required]],
      roleId: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
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
        this.roleOptions = (roles || []).map(r => ({ label: r.name, value: r.id }));
        this.isLoadingRoles = false;
      },
      error: () => { this.isLoadingRoles = false; }
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

    const payload = {
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      teamId: this.userForm.value.teamId,
      roleId: this.userForm.value.roleId,
    };
  }

  closeModalAndReset() {
    this.modalVisible = false;
    this.isLoading = false;
    this.isSuccess = false;
    this.isError = false;
    this.errorMessage = '';
    this.userForm.reset();
  }
}
