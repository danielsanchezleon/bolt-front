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

@Component({
  selector: 'app-analytics-module',
  imports: [PageWrapperComponent, ButtonModule, AccordionComponent, SelectButtonModule, CommonModule, FormsModule, SelectModule, MultiSelectModule, SliderModule, TableModule, CarouselModule, ChartModule, ProgressSpinnerModule],
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

  //Accordion 4
  alerts: any[] = [
    {"name":"CPU Usage","totalExec":83,"avgDuration":3.5,"median":3.1,"p95":7.3,"instances":[{"compOperation":">","value":80,"tags":[{"label":"severidad","value":"Critical"},{"label":"servicio","value":"Video"},{"label":"subservicio","value":"Streaming"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"PE"}],"totalExec":14,"avgDuration":3.2,"median":2.6,"p95":5.4},{"compOperation":">","value":80,"tags":[{"label":"severidad","value":"Critical"},{"label":"servicio","value":"Video"},{"label":"subservicio","value":"Streaming"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"AR"}],"totalExec":13,"avgDuration":3.8,"median":3.9,"p95":7.5},{"compOperation":">","value":70,"tags":[{"label":"severidad","value":"Major"},{"label":"servicio","value":"Video"},{"label":"subservicio","value":"Encoding"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"BR"}],"totalExec":11,"avgDuration":4.1,"median":3.8,"p95":9.8},{"compOperation":">","value":90,"tags":[{"label":"severidad","value":"Disaster"},{"label":"servicio","value":"Video"},{"label":"subservicio","value":"Transcoding"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"CO"}],"totalExec":11,"avgDuration":3.5,"median":2.9,"p95":6.2},{"compOperation":">","value":60,"tags":[{"label":"severidad","value":"Warning"},{"label":"servicio","value":"Video"},{"label":"subservicio","value":"Delivery"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"EC"}],"totalExec":8,"avgDuration":2.8,"median":3.1,"p95":4.2},{"compOperation":">","value":85,"tags":[{"label":"severidad","value":"Critical"},{"label":"servicio","value":"Video"},{"label":"subservicio","value":"Cache"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"DE"}],"totalExec":10,"avgDuration":4.2,"median":4.0,"p95":8.9},{"compOperation":">","value":75,"tags":[{"label":"severidad","value":"Major"},{"label":"servicio","value":"Video"},{"label":"subservicio","value":"Streaming"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"SP"}],"totalExec":9,"avgDuration":3.6,"median":3.9,"p95":5.5},{"compOperation":">","value":65,"tags":[{"label":"severidad","value":"Warning"},{"label":"servicio","value":"Video"},{"label":"subservicio","value":"Analytics"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"GL"}],"totalExec":7,"avgDuration":2.5,"median":2.6,"p95":4.6}]},
    {"name":"Memory Usage","totalExec":25,"avgDuration":7.4,"median":6.6,"p95":15.5,"instances":[{"compOperation":">","value":85,"tags":[{"label":"severidad","value":"Major"},{"label":"servicio","value":"Kernel"},{"label":"subservicio","value":"Infrastructure"},{"label":"plataforma","value":"GVP"},{"label":"OB","value":"PE"}],"totalExec":8,"avgDuration":7.2,"median":7.5,"p95":16.0},{"compOperation":">","value":85,"tags":[{"label":"severidad","value":"Major"},{"label":"servicio","value":"Kernel"},{"label":"subservicio","value":"Infrastructure"},{"label":"plataforma","value":"GVP"},{"label":"OB","value":"SP"}],"totalExec":8,"avgDuration":6.8,"median":5.9,"p95":16.8},{"compOperation":">","value":85,"tags":[{"label":"severidad","value":"Major"},{"label":"servicio","value":"Kernel"},{"label":"subservicio","value":"Infrastructure"},{"label":"plataforma","value":"GVP"},{"label":"OB","value":"EC"}],"totalExec":9,"avgDuration":8.1,"median":7.2,"p95":18.5}]},
    {"name":"Disk Space","totalExec":10,"avgDuration":12.0,"median":10.8,"p95":25.2,"instances":[{"compOperation":">","value":90,"tags":[{"label":"severidad","value":"Warning"},{"label":"servicio","value":"IA"},{"label":"subservicio","value":"Infrastructure"},{"label":"plataforma","value":"PPGG"},{"label":"OB","value":"DE"}],"totalExec":5,"avgDuration":12.3,"median":12.6,"p95":21.9},{"compOperation":">","value":90,"tags":[{"label":"severidad","value":"Warning"},{"label":"servicio","value":"IA"},{"label":"subservicio","value":"Infrastructure"},{"label":"plataforma","value":"PPGG"},{"label":"OB","value":"GL"}],"totalExec":5,"avgDuration":11.7,"median":13.6,"p95":22.6}]},
    {"name":"Response Time","totalExec":56,"avgDuration":4.1,"median":3.7,"p95":8.6,"instances":[{"compOperation":">","value":2,"tags":[{"label":"severidad","value":"Disaster"},{"label":"servicio","value":"Live"},{"label":"subservicio","value":"Streaming"},{"label":"plataforma","value":"QoE"},{"label":"OB","value":"PE"}],"totalExec":16,"avgDuration":4.2,"median":3.7,"p95":10.0},{"compOperation":">","value":2,"tags":[{"label":"severidad","value":"Disaster"},{"label":"servicio","value":"Live"},{"label":"subservicio","value":"Streaming"},{"label":"plataforma","value":"QoE"},{"label":"OB","value":"AR"}],"totalExec":14,"avgDuration":3.9,"median":4.2,"p95":9.3},{"compOperation":">","value":2,"tags":[{"label":"severidad","value":"Disaster"},{"label":"servicio","value":"Live"},{"label":"subservicio","value":"Delivery"},{"label":"plataforma","value":"QoE"},{"label":"OB","value":"BR"}],"totalExec":14,"avgDuration":4.5,"median":3.8,"p95":7.9},{"compOperation":">","value":2,"tags":[{"label":"severidad","value":"Disaster"},{"label":"servicio","value":"Live"},{"label":"subservicio","value":"Delivery"},{"label":"plataforma","value":"QoE"},{"label":"OB","value":"CO"}],"totalExec":12,"avgDuration":3.7,"median":4.3,"p95":7.4}]},
    {"name":"Error Rate","totalExec":27,"avgDuration":5.8,"median":5.3,"p95":12.3,"instances":[{"compOperation":">","value":5,"tags":[{"label":"severidad","value":"Major"},{"label":"servicio","value":"VOD"},{"label":"subservicio","value":"Delivery"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"PE"}],"totalExec":10,"avgDuration":5.8,"median":5.8,"p95":12.2},{"compOperation":">","value":5,"tags":[{"label":"severidad","value":"Major"},{"label":"servicio","value":"VOD"},{"label":"subservicio","value":"Delivery"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"SP"}],"totalExec":9,"avgDuration":6.2,"median":5.5,"p95":12.4},{"compOperation":">","value":5,"tags":[{"label":"severidad","value":"Major"},{"label":"servicio","value":"VOD"},{"label":"subservicio","value":"Transcoding"},{"label":"plataforma","value":"CDN"},{"label":"OB","value":"EC"}],"totalExec":8,"avgDuration":5.5,"median":4.8,"p95":10.1}]},
    {"name":"Network Latency","totalExec":22,"avgDuration":3.1,"median":2.8,"p95":6.4,"instances":[{"compOperation":">","value":100,"tags":[{"label":"severidad","value":"Warning"},{"label":"servicio","value":"IPTV"},{"label":"subservicio","value":"Network"},{"label":"plataforma","value":"IT"},{"label":"OB","value":"PE"}],"totalExec":7,"avgDuration":3.1,"median":2.7,"p95":7.4},{"compOperation":">","value":100,"tags":[{"label":"severidad","value":"Warning"},{"label":"servicio","value":"IPTV"},{"label":"subservicio","value":"Network"},{"label":"plataforma","value":"IT"},{"label":"OB","value":"AR"}],"totalExec":8,"avgDuration":2.8,"median":2.5,"p95":4.3},{"compOperation":">","value":100,"tags":[{"label":"severidad","value":"Warning"},{"label":"servicio","value":"IPTV"},{"label":"subservicio","value":"Network"},{"label":"plataforma","value":"IT"},{"label":"OB","value":"BR"}],"totalExec":7,"avgDuration":3.3,"median":2.7,"p95":8.0}]},
    {"name":"Buffering","totalExec":41,"avgDuration":6.8,"median":6.1,"p95":14.2,"instances":[{"compOperation":">","value":3,"tags":[{"label":"severidad","value":"Critical"},{"label":"servicio","value":"OTT"},{"label":"subservicio","value":"Streaming"},{"label":"plataforma","value":"QoE"},{"label":"OB","value":"PE"}],"totalExec":11,"avgDuration":6.7,"median":6.5,"p95":13.4},{"compOperation":">","value":3,"tags":[{"label":"severidad","value":"Critical"},{"label":"servicio","value":"OTT"},{"label":"subservicio","value":"Streaming"},{"label":"plataforma","value":"QoE"},{"label":"OB","value":"SP"}],"totalExec":10,"avgDuration":7.1,"median":6.1,"p95":17.4},{"compOperation":">","value":3,"tags":[{"label":"severidad","value":"Critical"},{"label":"servicio","value":"OTT"},{"label":"subservicio","value":"Delivery"},{"label":"plataforma","value":"QoE"},{"label":"OB","value":"CO"}],"totalExec":9,"avgDuration":6.3,"median":6.2,"p95":10.3},{"compOperation":">","value":3,"tags":[{"label":"severidad","value":"Critical"},{"label":"servicio","value":"OTT"},{"label":"subservicio","value":"Delivery"},{"label":"plataforma","value":"QoE"},{"label":"OB","value":"EC"}],"totalExec":11,"avgDuration":6.9,"median":7.5,"p95":16.7}]}
  ];

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
        console.log(response)
        this.generalMetricsResponse = response;
        this.generalMetricsResponseLoading = false;
      },
      (error) => {
        this.generalMetricsResponseLoading = false;
        this.generalMetricsResponseError = true;
      }
    );
  }
}
