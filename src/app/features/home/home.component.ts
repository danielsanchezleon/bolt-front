import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../shared/services/alert.service';
import { HomePanelsViewDto } from '../../shared/dto/home/HomePanelsViewDto';
import { SkeletonModule } from 'primeng/skeleton';
import { AlertViewDto } from '../../shared/dto/alert/AlertViewDto';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { modifyAlertTimeWindowOptions, periodicityOptions } from '../../shared/constants/metric-options';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-home',
  imports: [PageWrapperComponent, CommonModule, FormsModule, SelectButtonModule, TableModule, SkeletonModule, TooltipModule, PopoverModule, ButtonModule, SelectModule, InputNumberModule, FloatLabelModule, ReactiveFormsModule, PaginatorModule, InputTextModule, ToggleSwitchModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  isLoading: boolean = false;
  isError: boolean = false;
  homePanels?: HomePanelsViewDto;

  last24HoursAlertsLoading: boolean = false;
  last24HoursAlertsError: boolean = false;
  last24HoursAlertsPage: any = {};
  last24HoursAlertsList: any[] = [];

  severityOptions: any[] = [
    {value: 'DISASTER', label: 'Disaster'},
    {value: 'CRITICAL', label: 'Critical'},
    {value: 'MAJOR', label: 'Major'},
    {value: 'WARNING', label: 'Warning'}
  ];

  comparationOptions: any[] = [
    {value: 'MORE_THAN', label: 'Mayor que'},
    {value: 'LESS_THAN', label: 'Menor que'},
    {value: 'WITHIN_RANGE', label: 'Dentro del rango'},
    {value: 'OUT_OF_RANGE', label: 'Fuera del rango'}
  ];

  modifyAlertTimeWindowOptions: any[] = [];
  periodicityOptions: any[] = [];

  //Pagination
  first: number = 0;
  page: number = 0;
  size: number = 10;

  constructor(private router: Router, private alertService: AlertService, private _fb: FormBuilder) {
  }

  ngOnInit() 
  {
    this.getHomePanels();
    this.getLast24HoursAlerts(0, 10);

    this.modifyAlertTimeWindowOptions = modifyAlertTimeWindowOptions;
    this.periodicityOptions = periodicityOptions;
  }

  getHomePanels()
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

  onClickNavigateToCreateAlert()
  {
    this.router.navigate(['alert/create']);
  }

  onClickNavigateToModifyAlert()
  {
    this.router.navigate(['alerts']);
  }

  onClickNavigateToAnalyticsModule()
  {
    this.router.navigate(['analytics-module']);
  }

  getLast24HoursAlerts(page: number, size: number)
  {
    this.last24HoursAlertsLoading = true;
    this.last24HoursAlertsError = false;

    this.alertService.getLast24HoursAlerts(0, 5).subscribe(
      (response) => {
        this.last24HoursAlertsLoading = false;
        this.last24HoursAlertsPage = response;
        this.last24HoursAlertsList = response.content;
      },
      (error) => {
        this.last24HoursAlertsLoading = false;
        this.last24HoursAlertsError = true;
      }
    )
  }

  onClickGoToEditAlert(alert: AlertViewDto)
  {
    this.router.navigate(['alert', 'edit', alert.alertType, alert.alertId]);
  }

  onClickRemoveSeverity(alert: AlertViewDto, i: number)
  {
    alert.conditions?.splice(i, 1);
  }

  onPageChange(event: any) 
  {
    this.first = event.first;
    this.page = event.page;
    this.size = event.rows;

    this.getLast24HoursAlerts(this.page, this.size);
  }
}
