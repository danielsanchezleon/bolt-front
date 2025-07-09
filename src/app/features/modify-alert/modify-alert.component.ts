import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modify-alert',
  imports: [ButtonModule, PageWrapperComponent],
  templateUrl: './modify-alert.component.html',
  styleUrl: './modify-alert.component.scss'
})
export class ModifyAlertComponent 
{
  constructor(private router: Router) {}

  onClickNavigateToHome()
  {
    this.router.navigate(['']);
  }
}
