import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-alert',
  imports: [CommonModule, PageWrapperComponent, ButtonModule],
  templateUrl: './create-alert.component.html',
  styleUrl: './create-alert.component.scss'
})
export class CreateAlertComponent 
{
  alertTypeSelected: boolean = false;

  constructor(private router: Router)
  {
    const navigation = this.router.getCurrentNavigation();
    const isThreshold = navigation?.extras.state?.['isThreshold'];

    if (isThreshold)
      this.alertTypeSelected = true;
  }

  onClickNavigateToHome()
  {
    this.router.navigate(['']);
  }

  onClickNavigateToSimpleCondition()
  {
    this.router.navigate(['condicion-simple']);
  }

  onClickNavigateToLogs()
  {
    this.router.navigate(['logs']);
  }
}
