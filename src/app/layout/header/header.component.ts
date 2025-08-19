import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent 
{
  constructor(public router: Router, private authService: AuthService){}

  onClickNavigateToHome()
  {
    this.router.navigate(['']);
  }

  onClickNavigateToEndpoints()
  {
    this.router.navigate(['endpoints']);
  }

  onClickLogout()
  {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
