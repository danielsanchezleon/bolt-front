import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';

import { debounceTime, Subject } from 'rxjs';

import { UserViewDto } from '../../shared/dto/user/UserViewDto';
import { UserService } from '../../shared/services/user.service';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageWrapperComponent,
    ModalComponent,
    ButtonModule,
    TableModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SkeletonModule,
    PaginatorModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  private filterSubject = new Subject<string>();
  filterText = '';

  first: number = 0;
  page: number = 0;
  size: number = 10;

  isLoading: boolean = false;
  isError: boolean = false;

  userPage: any = {};
  userList: UserViewDto[] = [];
  userListFiltered: UserViewDto[] = [];

  selectedUser: UserViewDto | null = null;
  tableActions: MenuItem[] = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => this.onClickEditUser(this.selectedUser),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      command: () => this.openDeleteModal(this.selectedUser),
    },
  ];

  deleteModalVisible = false;
  isLoadingDelete = false;
  isDeleteSuccess = false;
  isDeleteError = false;
  deleteErrorMessage = '';

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.filterSubject.pipe(debounceTime(500)).subscribe(() => {
      this.getUsers(this.page, this.size);
    });

    this.getUsers(this.page, this.size);
  }

  onClickNavigateToHome() {
    this.router.navigate(['']);
  }

  onClickNavigateToCreateUser() {
    this.router.navigate(['crear-usuario']);
  }

  onClickEditUser(user: UserViewDto | null) {
    if (!user?.id) return;
    this.router.navigate(['usuarios', user.id, 'editar']);
  }

  getUsers(page: number, size: number) {
    this.isLoading = true;
    this.isError = false;

    this.userService.getUsers(page, size, this.filterText ? this.filterText : null).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.isError = false;

        this.userPage = response;
        this.userList = response.content;
        this.userListFiltered = response.content;
      },
      error: () => {
        this.isLoading = false;
        this.isError = true;
      },
    });
  }

  openDeleteModal(user: UserViewDto | null) {
    if (!user?.id) return;
    this.selectedUser = user;
    this.isLoadingDelete = false;
    this.isDeleteSuccess = false;
    this.isDeleteError = false;
    this.deleteErrorMessage = '';
    this.deleteModalVisible = true;
  }

  closeDeleteModal() {
    this.deleteModalVisible = false;
    this.selectedUser = null;
  }

  onConfirmDeleteUser() {
    if (!this.selectedUser?.id) return;

    this.isLoadingDelete = true;
    this.isDeleteSuccess = false;
    this.isDeleteError = false;
    this.deleteErrorMessage = '';

    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.isLoadingDelete = false;
        this.isDeleteSuccess = true;
        this.isDeleteError = false;

        this.getUsers(this.page, this.size);
      },
      error: (err) => {
        this.isLoadingDelete = false;
        this.isDeleteSuccess = false;
        this.isDeleteError = true;
        this.deleteErrorMessage = err?.error || 'No se pudo eliminar el usuario.';
      },
    });
  }


  onFilterUsersChange() {
    this.filterSubject.next(this.filterText);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.page = event.page;
    this.size = event.rows;
    this.getUsers(this.page, this.size);
  }
}