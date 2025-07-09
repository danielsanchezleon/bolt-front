import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [PageWrapperComponent, CommonModule, FormsModule, SelectButtonModule, TableModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  alerts = [];

  constructor(private router: Router) {}

  ngOnInit() {}

  onClickNavigateToCreateAlert()
  {
    this.router.navigate(['crear-alerta']);
  }

  onClickNavigateToModifyAlert()
  {
    this.router.navigate(['modificar-alerta']);
  }
}
