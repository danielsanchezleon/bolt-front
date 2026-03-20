import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AccordionComponent } from '../../shared/components/accordion/accordion.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { AlarmAnalyticsService } from '../../shared/services/alarm-analytics.service';
import { CarouselModule } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PopoverModule } from 'primeng/popover';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TabsModule } from 'primeng/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-analytics-module',
  imports: [PageWrapperComponent, ButtonModule, AccordionComponent, SelectButtonModule, CommonModule, FormsModule, SelectModule, MultiSelectModule, SliderModule, TableModule, CarouselModule, ChartModule, ProgressSpinnerModule, PopoverModule, IconFieldModule, InputIconModule, SkeletonModule, ReactiveFormsModule, InputTextModule, InputNumberModule, ToggleSwitchModule, TabsModule, PaginatorModule, DatePickerModule],
  templateUrl: './analytics-module.component.html',
  styleUrl: './analytics-module.component.scss'
})
export class AnalyticsModuleComponent implements OnInit, OnDestroy
{
  cityFilterOptions: any[] = [{ label: 'España', value: 'spain' },{ label: 'Alemania', value: 'germany' }];
  severityFilterOptions: any[] = [{ label: 'Critical + Disaster', value: 'critical-disaster' }];
  platformFilterOptions: any[] = [{ label: 'CDN', value: 'cdn' },{ label: 'GVP', value: 'GVP' },{ label: 'PPGG', value: 'ppgg' }];
  selectedCityFilterOption: any;
  selectedSeverityFilterOption: any;
  selectedPlatformFilterOption: any;

  timeFilterOptions: any[] = [
    { label: 'Últimas 6 horas', value: '6h' }, 
    { label: 'Últimas 12 horas', value: '12h' }, 
    { label: 'Últimas 24 horas', value: '24h' }, 
    { label: 'Últimos 3 días', value: '3d' }, 
    { label: 'Últimos 10 días', value: '10d' }, 
    { label: 'Último mes', value: '1m' }, 
    { label: 'Últimos 3 meses', value: '3m' }];
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

  firstCall: boolean = true;
  noiseAlertsTable: any;
  noiseAlertsTableLoading: boolean = false;
  noiseAlertsTableError: boolean = false;

  timeWindowOptions: any[] = [
    {label: 'Últimos/as', value: 'last'},
    {label: 'Rango', value: 'between'}
  ];

  unitTypes: any[] = [
    {label: 'Segundos', value: 'seconds'},
    {label: 'Minutos', value: 'minutes'},
    {label: 'Horas', value: 'hours'},
    {label: 'Días', value: 'days'},
    {label: 'Semanas', value: 'weeks'},
    {label: 'Meses', value: 'months'},
    {label: 'Años', value: 'years'}
  ];

  refreshUnitTypes: any[] = [
    {label: 'Segundos', value: 'seconds'},
    {label: 'Minutos', value: 'minutes'},
    {label: 'Horas', value: 'hours'}
  ];

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

  //Noise alerts
  noiseAlertsActiveTimeWindow: string = 'Esta semana';
  noiseAlertsFilterForm!: FormGroup;
  private noiseRefreshInterval: any = null;
  private noiseRefreshToggleSub: Subscription | null = null;

  //Active alarm instances table
  instancesActiveTimeWindow: string = 'Esta semana';

  instancesFilterForm!: FormGroup;
  @ViewChild('filterInput') filterInputRef!: ElementRef<HTMLInputElement>;
  private refreshInterval: any = null;
  private refreshToggleSub: Subscription | null = null;

  activeAlarmInstancesTable: any;
  activeAlarmInstancesTableLoading: boolean = false;
  activeAlarmInstancesTableError: boolean = false;

  first: number = 0;
  page: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 50, 100, 200, 500];

  bucketData: any;
  bucketOptions: any;

  constructor (private router: Router, private alarmAnalyticsService: AlarmAnalyticsService, private _fb: FormBuilder) {}

  ngOnInit()
  {
    this.getTotal();
    this.getTotalUnique();
    this.getTotalCreated();
    this.getSeverityDist();
    this.getObDist();
    this.getChannelDist();
    this.getServiceDist();
    this.getSourceDist();
    this.getGeneralMetrics();

    this.noiseAlertsFilterForm = this._fb.group({
      timeWindow: new FormControl(this.timeWindowOptions[0]),
      unit: new FormControl(this.unitTypes[2], Validators.required),
      unitValue: new FormControl(1, [Validators.required, Validators.min(1)]),
      from: new FormControl<Date | null>(null),
      to: new FormControl<Date | null>(null),
      refreshEveryToggle: new FormControl(false),
      refreshUnit: new FormControl(this.refreshUnitTypes[0]),
      refreshUnitValue: new FormControl(60)
    });

    this.noiseAlertsFilterForm.get('timeWindow')!.valueChanges.subscribe((tw: any) => {
      this._applyTimeWindowValidators(this.noiseAlertsFilterForm, tw?.value ?? tw);
    });

    this.noiseRefreshToggleSub = this.noiseAlertsFilterForm.get('refreshEveryToggle')!.valueChanges.subscribe((enabled: boolean) => {
      this._clearNoiseRefreshInterval();
      if (enabled) {
        this.getNoiseAlertsTable();
        this._startNoiseRefreshInterval();
      }
    });

    this.instancesFilterForm = this._fb.group({
      filterText: new FormControl(''),
      timeWindow: new FormControl(this.timeWindowOptions[0]),
      unit: new FormControl(this.unitTypes[2], Validators.required),
      unitValue: new FormControl(1, [Validators.required, Validators.min(1)]),
      from: new FormControl<Date | null>(null),
      to: new FormControl<Date | null>(null),
      refreshEveryToggle: new FormControl(false),
      refreshUnit: new FormControl(this.refreshUnitTypes[0]),
      refreshUnitValue: new FormControl(60)
    });

    this.instancesFilterForm.get('timeWindow')!.valueChanges.subscribe((tw: any) => {
      this._applyTimeWindowValidators(this.instancesFilterForm, tw?.value ?? tw);
    });

    this.refreshToggleSub = this.instancesFilterForm.get('refreshEveryToggle')!.valueChanges.subscribe((enabled: boolean) => {
      this._clearRefreshInterval();
      if (enabled) {
        this.getActiveAlarmInstancesTable(this.page, this.pageSize);
        this._startRefreshInterval();
      }
    });

    this._applyPreset('last24Hours', this.noiseAlertsFilterForm, (label) => this.noiseAlertsActiveTimeWindow = label);
    this._applyPreset('thisWeek', this.instancesFilterForm, (label) => this.instancesActiveTimeWindow = label);

    this.getNoiseAlertsTable();
    this.getActiveAlarmInstancesTable(this.page, this.pageSize);
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

  getNoiseAlertsTable()
  {
    this.noiseAlertsTableLoading = true;
    this.noiseAlertsTableError = false;

    const mode = this.noiseAlertsTimeWindowMode;
    const lastSeconds = (this.noiseAlertsFilterForm && mode === 'last')
      ? this._formToSeconds(this.noiseAlertsFilterForm, 'unit', 'unitValue')
      : null;
    const from = (this.noiseAlertsFilterForm && mode === 'between')
      ? this.noiseAlertsFilterForm.get('from')?.value ?? null
      : null;
    const to = (this.noiseAlertsFilterForm && mode === 'between')
      ? this.noiseAlertsFilterForm.get('to')?.value ?? null
      : null;

    this.alarmAnalyticsService.getAlertsTable(10, 500, lastSeconds, from, to).subscribe(
      (response) => {
        this.noiseAlertsTable = response;
        this.noiseAlertsTableLoading = false;
        this.firstCall = false;
      },
      (error) => {
        this.noiseAlertsTableLoading = false;
        this.noiseAlertsTableError = true;
      }
    );
  }

  getActiveAlarmInstancesTable(page: number, pageSize: number)
  {
    this.activeAlarmInstancesTableLoading = true;
    this.activeAlarmInstancesTableError = false;

    const mode = this.timeWindowMode;
    const filterText = this.instancesFilterForm ? this.instancesFilterForm.get('filterText')?.value : null;
    const lastSeconds = (this.instancesFilterForm && mode === 'last')
      ? this._formToSeconds(this.instancesFilterForm, 'unit', 'unitValue')
      : null;
    const from = (this.instancesFilterForm && mode === 'between')
      ? this.instancesFilterForm.get('from')?.value ?? null
      : null;
    const to = (this.instancesFilterForm && mode === 'between')
      ? this.instancesFilterForm.get('to')?.value ?? null
      : null;

    this.alarmAnalyticsService.getActiveAlarmInstancesResponse(page, pageSize, filterText, lastSeconds, from, to).subscribe(
      (response) => {
        this.activeAlarmInstancesTable = response;
        this.activeAlarmInstancesTableLoading = false;
        this.firstCall = false;

        //INIT BUCKET DATA
        this.bucketData = {
          labels: response.buckets.map((bucket: any) => bucket.datetime),
          datasets: [
            {
              data: response.buckets.map((bucket: any) => bucket.count),
            }
          ]
        };

        this.bucketOptions = {
          plugins: {
            legend: {
              display: false
            }
          }
        };
      },
      (error) => {
        this.activeAlarmInstancesTableLoading = false;
        this.activeAlarmInstancesTableError = true;
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

  onClickPreset(preset: string) {
    this._applyPreset(preset, this.instancesFilterForm, (label) => this.instancesActiveTimeWindow = label);
    this.getActiveAlarmInstancesTable(this.page, this.pageSize);
  }

  onClickNoisePreset(preset: string) {
    this._applyPreset(preset, this.noiseAlertsFilterForm, (label) => this.noiseAlertsActiveTimeWindow = label);
    this.getNoiseAlertsTable();
  }

  private _applyPreset(preset: string, form: FormGroup, setLabel: (label: string) => void): void {
    const now = new Date();
    let unit = this.unitTypes[0];
    let unitValue = 1;

    switch (preset) {
      case 'today': {
        const hoursElapsed = now.getHours() + (now.getMinutes() > 0 || now.getSeconds() > 0 ? 1 : 0) || 1;
        unit = this.unitTypes[2]; // hours
        unitValue = hoursElapsed;
        setLabel('Hoy');
        break;
      }
      case 'last24Hours':
        unit = this.unitTypes[2]; // hours
        unitValue = 24;
        setLabel('Últimas 24 horas');
        break;

      case 'thisWeek': {
        const dow = now.getDay();
        const daysSinceMonday = dow === 0 ? 6 : dow - 1;
        unit = this.unitTypes[3]; // days
        unitValue = daysSinceMonday || 1;
        setLabel('Esta semana');
        break;
      }
      case 'last7Days':
        unit = this.unitTypes[3]; // days
        unitValue = 7;
        setLabel('Últimos 7 días');
        break;

      case 'last15Minutes':
        unit = this.unitTypes[1]; // minutes
        unitValue = 15;
        setLabel('Últimos 15 minutos');
        break;

      case 'last30Minutes':
        unit = this.unitTypes[1]; // minutes
        unitValue = 30;
        setLabel('Últimos 30 minutos');
        break;

      case 'last1Hour':
        unit = this.unitTypes[2]; // hours
        unitValue = 1;
        setLabel('Última hora');
        break;

      case 'last30Days':
        unit = this.unitTypes[3]; // days
        unitValue = 30;
        setLabel('Últimos 30 días');
        break;

      case 'last90Days':
        unit = this.unitTypes[3]; // days
        unitValue = 90;
        setLabel('Últimos 90 días');
        break;

      case 'last1Year':
        unit = this.unitTypes[6]; // years
        unitValue = 1;
        setLabel('Último año');
        break;
    }

    form.patchValue({ unit, unitValue, timeWindow: this.timeWindowOptions[0] });
    this._applyTimeWindowValidators(form, 'last');
  }

  get noiseAlertsTimeWindowMode(): string {
    const tw = this.noiseAlertsFilterForm?.get('timeWindow')?.value;
    return tw?.value ?? tw ?? 'last';
  }

  get timeWindowMode(): string {
    const tw = this.instancesFilterForm?.get('timeWindow')?.value;
    return tw?.value ?? tw ?? 'last';
  }

  /** Applies the correct validators depending on the selected timeWindow mode. */
  private _applyTimeWindowValidators(form: FormGroup, mode: string): void {
    const unit      = form.get('unit')!;
    const unitValue = form.get('unitValue')!;
    const from      = form.get('from')!;
    const to        = form.get('to')!;

    if (mode === 'last') {
      unit.setValidators(Validators.required);
      unitValue.setValidators([Validators.required, Validators.min(1)]);
      from.clearValidators();
      to.clearValidators();
    } else {
      unit.clearValidators();
      unitValue.clearValidators();
      from.setValidators(Validators.required);
      to.setValidators(Validators.required);
    }

    unit.updateValueAndValidity();
    unitValue.updateValueAndValidity();
    from.updateValueAndValidity();
    to.updateValueAndValidity();
  }

  /** Converts the given unit+value form controls to a total number of seconds. */
  private _formToSeconds(form: FormGroup, unitControlName: string, valueControlName: string): number | null {
    const unit  = form.get(unitControlName)?.value;
    const value = form.get(valueControlName)?.value;

    if (!unit || value == null) return null;

    const multipliers: Record<string, number> = {
      seconds: 1,
      minutes: 60,
      hours: 3600,
      days: 86400,
      weeks: 604800,
      months: 2592000,
      years: 31536000
    };

    const unitKey = typeof unit === 'object' ? unit.value : unit;
    const multiplier = multipliers[unitKey] ?? 1;
    return value * multiplier;
  }

  private _startRefreshInterval(): void {
    const refreshSeconds = this._formToSeconds(this.instancesFilterForm, 'refreshUnit', 'refreshUnitValue') ?? 60;
    this.refreshInterval = setInterval(() => {
      this.getActiveAlarmInstancesTable(this.page, this.pageSize);
    }, refreshSeconds * 1000);
  }

  private _clearRefreshInterval(): void {
    if (this.refreshInterval !== null) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private _startNoiseRefreshInterval(): void {
    const refreshSeconds = this._formToSeconds(this.noiseAlertsFilterForm, 'refreshUnit', 'refreshUnitValue') ?? 60;
    this.noiseRefreshInterval = setInterval(() => {
      this.getNoiseAlertsTable();
    }, refreshSeconds * 1000);
  }

  private _clearNoiseRefreshInterval(): void {
    if (this.noiseRefreshInterval !== null) {
      clearInterval(this.noiseRefreshInterval);
      this.noiseRefreshInterval = null;
    }
  }

  ngOnDestroy(): void {
    this._clearRefreshInterval();
    this._clearNoiseRefreshInterval();
    this.refreshToggleSub?.unsubscribe();
    this.noiseRefreshToggleSub?.unsubscribe();
  }

  onPageChange(event: any)
  {
    this.first = event.first;
    this.page = event.page;
    this.pageSize = event.rows;
    this.getActiveAlarmInstancesTable(this.page, this.pageSize);
  }

  addFilter(field: string): void {
    const newValue = field + ": \"\"";
    this.instancesFilterForm.get('filterText')?.setValue(newValue);
    // Position cursor between the two quotes: one char before the end
    const cursorPos = newValue.length - 1;
    setTimeout(() => {
      const el = this.filterInputRef?.nativeElement;
      if (el) {
        el.focus();
        el.setSelectionRange(cursorPos, cursorPos);
      }
    });
  }
}
