import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { AlertService } from '../../shared/services/alert.service';
import { HomePanelsViewDto } from '../../shared/dto/home/HomePanelsViewDto';

@Component({
  selector: 'app-test',
  imports: [CommonModule, PageWrapperComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent 
{
  isLoading: boolean = false;
  isError: boolean = false;

  homePanels: HomePanelsViewDto | null = null;

  constructor (private alertService: AlertService) {}

  ngOnInit()
  {
    this.getAlerts();
  }

  getAlerts()
  {
    this.isLoading = true;
    this.isError = false;

    this.alertService.getHomePanels().subscribe(
      (response) => {
        this.isLoading = false;
        this.homePanels = response;
      },
      (error) => {
        this.isLoading = false;
        this.isError = true;
      }
    )
  }
}
