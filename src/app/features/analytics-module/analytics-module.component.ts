import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AccordionComponent } from '../../shared/components/accordion/accordion.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { AlarmAnalyticsService } from '../../shared/services/alarm-analytics.service';
import { CarouselModule } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PopoverModule } from 'primeng/popover';
import { AlertViewDto } from '../../shared/dto/alert/AlertViewDto';

@Component({
  selector: 'app-analytics-module',
  imports: [PageWrapperComponent, ButtonModule, AccordionComponent, SelectButtonModule, CommonModule, FormsModule, SelectModule, MultiSelectModule, SliderModule, TableModule, CarouselModule, ChartModule, ProgressSpinnerModule, PopoverModule],
  templateUrl: './analytics-module.component.html',
  styleUrl: './analytics-module.component.scss'
})
export class AnalyticsModuleComponent 
{
  cityFilterOptions: any[] = [{ label: 'España', value: 'spain' },{ label: 'Alemania', value: 'germany' }];
  severityFilterOptions: any[] = [{ label: 'Critical + Disaster', value: 'critical-disaster' }];
  platformFilterOptions: any[] = [{ label: 'CDN', value: 'cdn' },{ label: 'GVP', value: 'GVP' },{ label: 'PPGG', value: 'ppgg' }];
  selectedCityFilterOption: any;
  selectedSeverityFilterOption: any;
  selectedPlatformFilterOption: any;

  timeFilterOptions: any[] = [{ label: 'Últimas 6 horas', value: '6h' }, { label: 'Últimas 12 horas', value: '12h' }, { label: 'Últimas 24 horas', value: '24h' }, { label: 'Últimos 3 días', value: '3d' }, { label: 'Últimos 10 días', value: '10d' }, { label: 'Último mes', value: '1m' }, { label: 'Últimos 3 meses', value: '3m' }];
  selectedTimeFilterOption: any;

  groupedFilters: any[] = [
    {
      label: 'OB',
      value: 'ob',
      items: [
        { label: 'PE', value: 'pe' },
        { label: 'AR', value: 'ar' },
        { label: 'BR', value: 'br' },
        { label: 'EC', value: 'ec' },
        { label: 'DE', value: 'de' },
        { label: 'CO', value: 'co' },
        { label: 'SP', value: 'sp' },
        { label: 'GL', value: 'GL' }
      ]
    },
    {
      label: 'Severidad',
      value: 'severity',
      items: [
        { label: 'Disaster', value: 'disaster' },
        { label: 'Critical', value: 'critical' },
        { label: 'Major', value: 'major' },
        { label: 'Warning', value: 'warning' }
      ]
    },
    {
      label: 'Servicio',
      value: 'service',
      items: [
        { label: 'Video', value: 'video' },
        { label: 'Kernel', value: 'kernel' },
        { label: 'LA', value: 'la' },
        { label: 'SW', value: 'sw' },
        { label: 'MC', value: 'mc' },
        { label: 'Observabilidad', value: 'observability' }
      ]
    },
    {
      label: 'Subservicio',
      value: 'subservice',
      items: [
        { label: 'Live', value: 'live' },
        { label: 'VOD', value: 'vod' },
        { label: 'IPTV', value: 'iptv' },
        { label: 'OTT', value: 'ott' },
        { label: 'Playback', value: 'playback' },
        { label: 'Navegación', value: 'navigation' },
        { label: 'VOD L7D', value: 'vod-l7d' },
        { label: 'VOD Standard', value: 'vod-standard' }
      ]
    },
    {
      label: 'Plataforma',
      value: 'platform',
      items: [
        { label: 'CDN', value: 'cdn' },
        { label: 'GVP', value: 'GVP' },
        { label: 'PPGG', value: 'ppgg' },
        { label: 'QoE', value: 'qoe' },
        { label: 'IT', value: 'it' }
      ]
    }
  ];
  selectedElements: any[] = [];

  //Accordion 2
  selectedPercentile: number = 50;

  totalResponse: any;
  totalResponseLoading: boolean = false;
  totalResponseError: boolean = false;

  totalUniqueResponse: any;
  totalUniqueResponseLoading: boolean = false;
  totalUniqueResponseError: boolean = false;

  totalCreatedResponse: any;
  totalCreatedResponseLoading: boolean = false;
  totalCreatedResponseError: boolean = false;

  selectedChartId: number = 0;
  
  obDistData: any;
  obDistResponseLoading: boolean = false;
  obDistResponseError: boolean = false;

  severityDistData: any;
  severityDistResponseLoading: boolean = false;
  severityDistResponseError: boolean = false;

  channelDistData: any;
  channelDistResponseLoading: boolean = false;
  channelDistResponseError: boolean = false;

  serviceDistData: any;
  serviceDistResponseLoading: boolean = false;
  serviceDistResponseError: boolean = false;

  sourceDistData: any;
  sourceDistResponseLoading: boolean = false;
  sourceDistResponseError: boolean = false;

  generalMetricsResponse: any;
  generalMetricsResponseLoading: boolean = false;
  generalMetricsResponseError: boolean = false;

  generalMetricsFirstGroup: any[] = [];
  generalMetricsSecondGroup: any[] = [];
  generalMetricsThirdGroup: any[] = [];

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


  constructor (private router: Router, private alarmAnalyticsService: AlarmAnalyticsService) {}

  ngOnInit()
  {
    this.getTotal();
    this.getTotalUnique();
    this.getTotalCreated();
    this.getSeverityDist();
    // this.getTopAlerts(10);
    // this.getDrillDown(1, 5);
    this.getObDist();
    this.getChannelDist();
    this.getServiceDist();
    this.getSourceDist();
    this.getGeneralMetrics();
    this.getAlertDrilldownTable();
  }

  onClickNavigateToHome() {
    this.router.navigate(['']);
  }

  onClickClearFilters()
  {
    this.selectedCityFilterOption = null;
    this.selectedSeverityFilterOption = null;
    this.selectedPlatformFilterOption = null;
  }

  onCityFilterChange()
  {

  }

  onSeverityFilterChange()
  {

  }

  onPlatformFilterChange()
  {
    
  }

  getTotal()
  {
    this.totalResponseLoading = true;
    this.alarmAnalyticsService.getTotal().subscribe(
      (response) => {
        this.totalResponse = response;
        this.totalResponseLoading = false;
      },
      (error) => {
        this.totalResponseLoading = false;
        this.totalResponseError = true;
      }
    );
  }

  getTotalUnique()
  {
    this.totalUniqueResponseLoading = true;
    this.alarmAnalyticsService.getTotalUnique().subscribe(
      (response) => {
        this.totalUniqueResponse = response;
        this.totalUniqueResponseLoading = false;
      },
      (error) => {
        this.totalUniqueResponseLoading = false;
        this.totalUniqueResponseError = true;
      }
    );
  }

  getTotalCreated()
  {
    this.totalCreatedResponseLoading = true;
    this.alarmAnalyticsService.getTotalCreated().subscribe(
      (response) => {
        this.totalCreatedResponse = response;
        this.totalCreatedResponseLoading = false;
      },
      (error) => {
        this.totalCreatedResponseLoading = false;
        this.totalCreatedResponseError = true;
      }
    );
  }

  getSeverityDist()
  {
    this.severityDistResponseLoading = true;

    this.alarmAnalyticsService.getSeverityDist().subscribe(
      (response) => {
        const labels = response.map((item: any) => item.label);
        const data = response.map((item: any) => item.count);

        this.severityDistData = {
          labels,
          datasets: [
            {
              data
            }
          ]
        };

        this.severityDistResponseLoading = false;
      },
      (error) => {
        this.severityDistResponseLoading = false;
        this.severityDistResponseError = true;
      }
    );
  }

  getTopAlerts(n: number)
  {
    this.alarmAnalyticsService.getTopAlerts(n).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.error('Error fetching top alerts:', error);
      }
    );
  }

  getDrillDown(alertId: number, n: number)
  {
    this.alarmAnalyticsService.getDrillDown(alertId, n).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.error('Error fetching drill down data:', error);
      }
    );
  }

  getObDist()
  {
    this.obDistResponseLoading = true;

    this.alarmAnalyticsService.getObDist().subscribe(
      (response) => {
        const labels = response.map((item: any) => item.label);
        const data = response.map((item: any) => item.count);

        this.obDistData = {
          labels,
          datasets: [
            {
              data
            }
          ]
        };

        this.obDistResponseLoading = false;
      },
      (error) => {
        this.obDistResponseLoading = false;
        this.obDistResponseError = true;
      }
    );
  }

  getChannelDist()
  {
    this.channelDistResponseLoading = true;

    this.alarmAnalyticsService.getChannelDist().subscribe(
      (response) => {
        const labels = response.map((item: any) => item.label);
        const data = response.map((item: any) => item.count);

        this.channelDistData = {
          labels,
          datasets: [
            {
              data
            }
          ]
        };
        this.channelDistResponseLoading = false;
      },
      (error) => {
        this.channelDistResponseLoading = false;
        this.channelDistResponseError = true;
      }
    );
  }

  getServiceDist()
  {
    this.serviceDistResponseLoading = true;

    this.alarmAnalyticsService.getServiceDist().subscribe(
      (response) => {
        const labels = response.map((item: any) => item.label);
        const data = response.map((item: any) => item.count);

        this.serviceDistData = {
          labels,
          datasets: [
            {
              data
            }
          ]
        };
        this.serviceDistResponseLoading = false;
      },
      (error) => {
        this.serviceDistResponseLoading = false;
        this.serviceDistResponseError = true;
      }
    );
  }

  getSourceDist()
  {
    this.sourceDistResponseLoading = true;

    this.alarmAnalyticsService.getSourceDist().subscribe(
      (response) => {
        const labels = response.map((item: any) => item.label);
        const data = response.map((item: any) => item.count);

        this.sourceDistData = {
          labels,
          datasets: [
            {
              data
            }
          ]
        };
        this.sourceDistResponseLoading = false;
      },
      (error) => {
        this.sourceDistResponseLoading = false;
        this.sourceDistResponseError = true;
      }
    );
  }

  onClickPreviousChart()
  {
    this.selectedChartId = (this.selectedChartId - 1 + 5) % 5;
  }

  onClickNextChart()
  {
    this.selectedChartId = (this.selectedChartId + 1) % 5;
  }

  getGeneralMetrics()
  {
    this.generalMetricsResponseLoading = true;
    this.generalMetricsResponseError = false;

    this.alarmAnalyticsService.getGeneralMetrics().subscribe(
      (response) => {
        this.generalMetricsResponse = response;

        // Split 8 elements response into three groups
        this.generalMetricsFirstGroup = response.slice(0, 3);
        this.generalMetricsSecondGroup = response.slice(3, 6);
        this.generalMetricsThirdGroup = response.slice(6, 8);

        this.generalMetricsResponseLoading = false;
      },
      (error) => {
        this.generalMetricsResponseLoading = false;
        this.generalMetricsResponseError = true;
      }
    );
  }

  getAlertDrilldownTable()
  {
    this.alertDrilldownTableLoading = true;
    this.alertDrilldownTableError = false;

    this.alarmAnalyticsService.getAlertsTable(10, 10).subscribe(
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

  onClickGoToEditAlert(alert: any)
  {
    this.router.navigate(['alert', 'edit', alert.alertType, alert.label]);
  }
}
