import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-alert',
  imports: [CommonModule, PageWrapperComponent, ButtonModule ],
  templateUrl: './create-alert.component.html',
  styleUrl: './create-alert.component.scss'
})
export class CreateAlertComponent 
{
  thresholdTypeSelected: boolean = false;
  baselineTypeSelected: boolean = false;

  constructor(private router: Router)
  {
    const navigation = this.router.getCurrentNavigation();
    const isThreshold = navigation?.extras.state?.['isThreshold'];

    if (isThreshold)
      this.thresholdTypeSelected = true;

  }

  onClickNavigateToHome()
  {
    this.router.navigate(['']);
  }

  onClickNavigateToSimpleCondition()
  {
    this.router.navigate(['alert/create', 'simple']);
  }

  onClickNavigateToCompositeCondition()
  {
    this.router.navigate(['alert/create', 'composite']);
  }

  onClickNavigateToBaseline(type: string)
  {
    this.router.navigate(['alert/create', 'baseline', type]);
  }

  onClickNavigateToLogs()
  {
    this.router.navigate(['alert/create', 'logs']);
  }
}
