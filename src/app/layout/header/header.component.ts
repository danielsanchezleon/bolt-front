import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent 
{
  constructor(public router: Router){}

  onClickNavigateToHome()
  {
    this.router.navigate(['']);
  }

  onClickNavigateToEndpoints()
  {
    this.router.navigate(['endpoints']);
  }
}
