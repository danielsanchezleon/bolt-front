import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AlarmAnalyticsService } from '../../shared/services/alarm-analytics.service';

@Component({
  selector: 'app-home',
  imports: [PageWrapperComponent, CommonModule, FormsModule, SelectButtonModule, TableModule, SkeletonModule, TooltipModule, PopoverModule, ButtonModule, SelectModule, InputNumberModule, FloatLabelModule, ReactiveFormsModule, PaginatorModule, InputTextModule, ToggleSwitchModule, ProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  isLoading: boolean = false;
  isError: boolean = false;
  homePanels?: HomePanelsViewDto;

  alertDrilldownTable: any;
  alertDrilldownTableLoading: boolean = false;
  alertDrilldownTableError: boolean = false;

  pastelChips: string[] = [
    '#F2B6BC', // rosa
    '#F6C98B', // melocotón
    '#F3E08A', // amarillo
    '#BFE6D3', // verde menta
    '#CDE3A8', // verde pastel
    '#B8E0E8', // turquesa
    '#C9B8F2', // lavanda
    '#BFD6F6', // azul pastel
    '#D9D9D9', // gris claro
    '#D8AFCF'  // lila rosado
  ];

  constructor(private router: Router, private alertService: AlertService, private _fb: FormBuilder, private alarmAnalyticsService: AlarmAnalyticsService) {
  }

  ngOnInit() 
  {
    this.getHomePanels();
    this.getAlertDrilldownTable();
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

  onClickGoToEditAlert(alert: AlertViewDto)
  {
    this.router.navigate(['alert', 'edit', alert.alertType, alert.alertId]);
  }

  onClickRemoveSeverity(alert: AlertViewDto, i: number)
  {
    alert.conditions?.splice(i, 1);
  }

  getAlertDrilldownTable()
  {
    this.alertDrilldownTableLoading = true;
    this.alertDrilldownTableError = false;

    this.alarmAnalyticsService.getAlertsTable(null, null, 24).subscribe(
      (response) => {
        this.alertDrilldownTable = response;
        this.alertDrilldownTableLoading = false;
      },
      (error) => {
        this.alertDrilldownTableLoading = false;
        this.alertDrilldownTableError = true;
      }
    );
  }

  getKeysCount(obj: any): number {
    return obj ? Object.keys(obj).length : 0;
  }

  buildKeyValueArray(obj: Record<string, any>): string[] 
  {
  if (!obj || typeof obj !== 'object') {
    return [];
  }

  return Object.entries(obj).map(
      ([key, value]) => `${key}: ${String(value)}`
    );
  }

  onClickGoToEditAlert2(alert: any)
  {
    this.router.navigate(['alert', 'edit', alert.alertType, alert.label]);
  }
}
