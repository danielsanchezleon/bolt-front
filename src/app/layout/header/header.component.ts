import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  showConfigMenu = false;

  constructor(public router: Router, private authService: AuthService) {}

  get isAdmin(): boolean {
    return this.authService.getRoles()?.includes('ADMIN') ?? false;
  }

  @HostListener('document:click')
  onDocClick() {
    this.showConfigMenu = false;
  }

  toggleConfigMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showConfigMenu = !this.showConfigMenu;
  }

  goToEndpoints() {
    this.showConfigMenu = false;
    this.router.navigate(['endpoints']);
  }

  goToUsers() {
    this.showConfigMenu = false;
    this.router.navigate(['usuarios']);
  }

  onClickNavigateToHome() { this.router.navigate(['']); }
  onClickLogout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}