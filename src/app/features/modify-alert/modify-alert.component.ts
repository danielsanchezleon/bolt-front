import { Component, OnInit } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PopoverModule } from 'primeng/popover';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { modifyAlertTimeWindowOptions, periodicityOptions } from '../../shared/constants/metric-options';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AlertService } from '../../shared/services/alert.service';
import { AlertViewDto } from '../../shared/dto/alert/AlertViewDto';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { AlertConditionViewDto } from '../../shared/dto/alert/AlertConditionViewDto';
import { AlertClauseViewDto } from '../../shared/dto/alert/AlertClauseViewDto';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PaginatorModule } from 'primeng/paginator';
import { MetadataService } from '../../shared/services/metadata.service';
import { AlertPermissionDto } from '../../shared/dto/AlertPermissionDto';
import { AlertConditionHistoryDto } from '../../shared/dto/AlertConditionHistoryDto';
import { EndpointAlertDto } from '../../shared/dto/EndpointAlertDto';
import { AlertSilenceDto } from '../../shared/dto/AlertSilenceDto';
import { AlertIndicatorDto } from '../../shared/dto/AlertIndicatorDto';
import { AlertMetricDto } from '../../shared/dto/AlertMetricDto';
import { AlertConditionDto } from '../../shared/dto/AlertConditionDto';
import { AlertDto } from '../../shared/dto/AlertDto';
import { ConditionFilterDto } from '../../shared/dto/ConditionFilterDto';
import { AlertClauseDto } from '../../shared/dto/AlertClauseDto';
import { BaselinesVariablesDto } from '../../shared/dto/BaselinesVariablesDto';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-modify-alert',
  imports: [FormsModule, ToggleSwitchModule, TextareaModule, SelectModule, PopoverModule, ReactiveFormsModule, InputNumberModule, MultiSelectModule, FloatLabelModule, InputTextModule, InputIconModule, IconFieldModule, MenuModule, TableModule, CommonModule, ButtonModule, PageWrapperComponent, SkeletonModule, ModalComponent, PaginatorModule, ToastModule, TooltipModule, ProgressSpinnerModule],
  templateUrl: './modify-alert.component.html',
  styleUrl: './modify-alert.component.scss',
  animations: [
    trigger('accordionAnimation', [
      state('closed', style({
        height: '0px',
        padding: '0 1rem',
        opacity: 0,
      })),
      state('open', style({
        height: '*',
        padding: '1rem',
        opacity: 1,
      })),
      transition('closed <=> open', [
        animate('300ms ease-in-out')
      ])
    ]),
    trigger('slideUp', [
      state('hidden', style({ transform: 'translateY(100%)', opacity: 0 })),
      state('visible', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('hidden => visible', [
        animate('300ms ease-out')
      ]),
      transition('visible => hidden', [
        animate('0ms ease-in')
      ]),
    ]),
  ],
  providers: [MessageService]
})
export class ModifyAlertComponent implements OnInit
{
  //METADATA FILTERS
  servicesList: string[] = [];
  sourcesList: string[] = [];
  dataTypesList: string[] = [];
  categoriesList: string[] = [];

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

  filterTextControl: FormControl = new FormControl('');

  firstCall: boolean = true;
  isLoading: boolean = false;
  isError: boolean = false;
  alertsPage: any = {};
  alertList: AlertViewDto[] = [];
  currentAlertList: AlertViewDto[] = [];
  changedAlerts: AlertViewDto[] = [];

  filterPanelOpen: boolean = false;

  modifyAlertTimeWindowOptions: any[] = [];
  periodicityOptions: any[] = [];

  tagForm: FormGroup;

  filterForm!: FormGroup;

  selectedAlerts: AlertViewDto[] = [];

  //UPDATE ALERTS
  saveChangesModalVisible: boolean = false;

  saveChangesMapLoading: Map<number, boolean> = new Map();
  saveChangesMapSuccess: Map<number, boolean> = new Map();
  saveChangesMapError: Map<number, boolean> = new Map();

  failedUpdates: number = 0;
  completedUpdates: number = 0;

  //DELETE ALERTS
  deleteAlertsModalVisible: boolean = false;

  deleteAlertsMapLoading: Map<number, boolean> = new Map();
  deleteAlertsMapSuccess: Map<number, boolean> = new Map();
  deleteAlertsMapError: Map<number, boolean> = new Map();

  failedDeletes: number = 0;
  completedDeletes: number = 0;

  //RECREATE ALERTS
  recreateAlertModalVisible: boolean = false;

  recreateAlertsMapLoading: Map<number, boolean> = new Map();
  recreateAlertsMapSuccess: Map<number, boolean> = new Map()
  recreateAlertsMapError: Map<number, boolean> = new Map();

  failedRecreates: number = 0;
  completedRecreates: number = 0;

  alertMessageEdited: AlertViewDto | null = null;
  newAlertMessage: string = '';

  //Pagination
  first: number = 0;
  page: number = 0;
  size: number = 20;

  constructor(private router: Router, private _fb: FormBuilder, private alertService: AlertService, private route: ActivatedRoute, private metadataService: MetadataService, private messageService: MessageService) 
  {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { alertId: any };
    
    this.getAllAlerts(this.page, this.size, null);

    this.tagForm = this._fb.group({
      name: ['', [Validators.required]],
      value: ['', [Validators.required]]
    });
  }

  ngOnInit() 
  {
    this.filterForm = this._fb.group({
      filterText: new FormControl(''),
      service: new FormControl(''),
      source: new FormControl(''),
      dataType: new FormControl(''),
      category: new FormControl('')
    });

    this.filterForm.valueChanges
    .pipe(
      debounceTime(1000), // espera 300ms tras dejar de escribir
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    )
    .subscribe(filters => 
    {
      this.getAllAlerts(this.page, this.size, filters)
    });

    this.getServices();
    this.getSources();
    this.getDataTypes();
    this.getCategories();

    this.modifyAlertTimeWindowOptions = modifyAlertTimeWindowOptions;
    this.periodicityOptions = periodicityOptions;
  }

  hasChanges(): boolean 
  {
    return JSON.stringify(this.alertList) !== JSON.stringify(this.currentAlertList);
  }

  getChangedAlerts()
  {
    this.changedAlerts = [];
    for (let i = 0; i < this.currentAlertList.length; i++)
    {
      if ( (JSON.stringify(this.alertList[i]) !== JSON.stringify(this.currentAlertList[i])) && (this.alertList[i].alertId == this.currentAlertList[i].alertId))
      {
        this.changedAlerts.push(this.currentAlertList[i]);

        this.saveChangesMapLoading.set(this.currentAlertList[i].alertId!, false);
        this.saveChangesMapSuccess.set(this.currentAlertList[i].alertId!, false);
        this.saveChangesMapError.set(this.currentAlertList[i].alertId!, false);
      }
    }
  }

  onClickNavigateToHome() {
    this.router.navigate(['']);
  }

  onClickAddTag(alert: AlertViewDto) {
    alert.alertTags?.push({ name: this.tagForm.get('name')?.value, value: this.tagForm.get('value')?.value });

    this.tagForm.reset();
    this.tagForm.updateValueAndValidity();
  }

  onClickRemoveTag(alert: any, i: number) {
    alert.alertTags.splice(i, 1);
  }

  clearIndividualFilters() {
    this.filterForm.reset();
    this.filterForm.updateValueAndValidity();
  }

  onClickAddSeverity(alert: AlertViewDto)
  {
    let availableSeverity: string = "";

    let found: boolean = false;

    this.severityOptions.forEach((severityOption) => {
      let notExisting: boolean = true;
      alert.conditions?.forEach((severity) => {
        if (severity.severity == severityOption.value)
        {
          notExisting = false;
        }
      });

      if (notExisting && !found)
      {
        found = true;
        availableSeverity = severityOption.value;
      }
    });

    let newCondition: AlertConditionViewDto = new AlertConditionViewDto(availableSeverity, true);
    newCondition.alertClauses?.push(new AlertClauseViewDto(null, alert.indicators![0].name!, null, 'MORE_THAN', null, null, 1, null, null, null, null));

    alert.conditions?.push(newCondition);
  }

  onClickRemoveSeverity(alert: AlertViewDto, i: number)
  {
    alert.conditions?.splice(i, 1);
  }

  onChangeGlobalTimeWindow(event: SelectChangeEvent)
  {
    this.selectedAlerts.forEach(alert => {
      alert.evaluationFrequency = event.value;
    });
  }

  onChangeGlobalPeriodicity(event: SelectChangeEvent)
  {
    this.selectedAlerts.forEach(alert => {
      alert.evaluationPeriod = event.value;
    });
  }

  onClickConfirmSaveChanges()
  {
    this.messageService.clear();
    
    this.changedAlerts.forEach((alert) => {
      this.updateAlert(alert);
    });
  }

  updateAlert(alert: AlertViewDto)
  {
    this.saveChangesMapLoading.set(alert.alertId!, true);
    this.saveChangesMapSuccess.set(alert.alertId!, false);
    this.saveChangesMapError.set(alert.alertId!, false);

    //PERMISSIONS
    let alertPermissions: AlertPermissionDto[] = [];
    
    for (let permission of alert.permissions!)
    {
      alertPermissions.push(new AlertPermissionDto(permission.id!, permission.writePermission!, permission.teamId!));
    }
    
    //CONDITION HISTORIES
    let alertConditionHistories: AlertConditionHistoryDto[] = [];
    
    //ENDPOINTS
    let endpointAlerts: EndpointAlertDto[] = [];
    
    for (let endpoint of alert.endpoints!) 
    {
      let endpointAlert: EndpointAlertDto = new EndpointAlertDto(endpoint.id!, endpoint.severities!, endpoint.endpointId!);
      endpointAlerts.push(endpointAlert);
    }
    
    //PERIODOS DE SILENCIO
    let alertSilences: AlertSilenceDto[] = [];

    // for (let silencePeriod of alert.silencePeriods!) {
    //   let days: any[] = silencePeriod.get('days')?.value!;

    //   for (let i = 0; i < days.length; i++) {
    //     let fromHour = silencePeriod.get('from')?.value!.getHours().toString().padStart(2, '0');
    //     let fromMinutes = silencePeriod.get('from')?.value!.getMinutes().toString().padStart(2, '0');
    //     let toHour = silencePeriod.get('to')?.value!.getHours().toString().padStart(2, '0');
    //     let toMinutes = silencePeriod.get('to')?.value!.getMinutes().toString().padStart(2, '0');
    //     alertSilences.push(new AlertSilenceDto(null, days[i].value, fromHour+':'+fromMinutes, toHour+':'+toMinutes));
    //   }
    // }
    
    //INDICATORS
    let alertIndicators: AlertIndicatorDto[] = [];
    
    for (let i = 0; i < alert.indicators!.length; i++)
    {
      //METRICS
      let alertMetrics: AlertMetricDto[] = [];

      for (let metric of alert.indicators![i].alertMetrics!) 
      {
        alertMetrics.push(new AlertMetricDto(metric.metricId!, metric.dbName!, metric.tableName!, metric.metricName!, metric.operation!, metric.dimensions!, null));
      }

      alertIndicators.push(new AlertIndicatorDto(alert.indicators![i].id!, alert.indicators![i].name!, alertMetrics, alert.indicators![i].finalExpression!, alert.indicators![i].isBaseline!));
    }
    
    //CONDITIONS
    let alertConditions: AlertConditionDto[] = [];
    
    for (let condition of alert.conditions!) 
    {
      let conditionFiltersList: ConditionFilterDto[] = [];
      let alertClauses: AlertClauseDto[] = [];
    
      //CLAUSES
      for (let clause of condition.alertClauses!) {
        alertClauses.push(new AlertClauseDto(clause.id!, clause.indicatorName!, clause.startBrackets!, clause.compOperation!, clause.threshold!, clause.endBrackets!, clause.order!, clause.externalOperation!, clause.thresholdInclude!, clause.thresholdUp!, clause.thresholdIncludeUp!));
      }
    
      //CONDITION FILTERS
      for (let conditionFilter of condition.conditionFilters!) {
        conditionFiltersList.push(new ConditionFilterDto(null, conditionFilter.externalOperation!, conditionFilter.compOperation!, conditionFilter.filterField!, conditionFilter.filterValue!, conditionFilter.isCreated!));
      }
    
      let baselinesVariablesDto: BaselinesVariablesDto | null = null;

      if (alert.alertType == 'baseline')
      {
        baselinesVariablesDto = new BaselinesVariablesDto(condition.baselinesVariables!.id!, condition.baselinesVariables!.auxVar1!, condition.baselinesVariables!.auxVar2!, condition.baselinesVariables!.auxVar3!);
      }

      alertConditions.push(new AlertConditionDto(condition.id!, condition.severity!, condition.status!, baselinesVariablesDto, alertClauses, conditionFiltersList));
    }
    
    //ALERTA
    let alertDto: AlertDto = new AlertDto(
      alert.internalName!,
      alert.name!,
      alert.alertText!,
      alert.alertDetail!,
      alert.alertTags!,
      alert.evaluationFrequency!,
      alert.evaluationPeriod!,
      alert.alertType == 'simple' ? 0 : alert.alertType == 'composite' ? 1 : alert.alertType == 'logs' ? 2 : 3,
      alert.offset!,
      alert.groupBy!,
      alert.opiUrl!,
      alert.alarmNumPeriods,
      alert.alarmTotalPeriods,
      alert.recoveryNumPeriods,
      alert.recoveryTotalPeriods,
      alert.logsService!,
      alert.logsCatalog!,
      alert.baselineType!
    );

    alertDto.alertConditions = alertConditions;
    alertDto.alertSilences = alertSilences;
    alertDto.endpointAlerts = endpointAlerts;
    alertDto.alertIndicators = alertIndicators;
    alertDto.alertPermissions = alertPermissions;
    alertDto.alertConditionHistories = alertConditionHistories;

    this.alertService.crupdateAlert(alert.alertId!, alertDto).subscribe(
      (response) => {
        this.saveChangesMapLoading.set(alert.alertId!, false);
        this.saveChangesMapSuccess.set(alert.alertId!, true);
        this.saveChangesMapError.set(alert.alertId!, false);
        this.completedUpdates++;

        if (response.dbSuccess && response.dolphinSuccess)
        {
          this.showToast('success', 'Alerta actualizada', `La alerta #${alert.alertId} ha sido actualizada correctamente.`);
        }
        else if (response.dbSuccess)
        {
          this.showToast('warn', 'Error de dolphin', `La alerta #${alert.alertId} ha sido actualizada en la base de datos, pero ha habido un error al actualizarla en Dolphin.`);
        }
        else if (!response.dbSuccess && !response.dolphinSuccess)
        {
          this.showToast('error', 'Error de actualización', `La alerta #${alert.alertId} no ha podido ser actualizada.`);
        }

        if ((this.completedUpdates == this.changedAlerts.length) && this.failedUpdates == 0)
        {
          this.getAllAlerts(this.page, this.size, this.filterForm.value);
          this.saveChangesModalVisible = false;
          this.completedUpdates = 0;
          this.failedUpdates = 0;
          this.selectedAlerts = [];
        }
      },
      (error) => {
        this.saveChangesMapLoading.set(alert.alertId!, false);
        this.saveChangesMapSuccess.set(alert.alertId!, false);
        this.saveChangesMapError.set(alert.alertId!, true);
        this.completedUpdates++;
        this.failedUpdates++;

        this.showToast('error', 'Error de actualización', `La alerta #${alert.alertId} no ha podido ser actualizada.`);
      }
    )
  }

  saveChangesLoading(): boolean
  {
    for (const value of this.saveChangesMapLoading.values()) 
    {
      if (value) 
      {
        return true;
      }
    }

    return false;
  }

  onClickGoToEditAlert(alert: AlertViewDto)
  {
    this.router.navigate(['alert', 'edit', alert.alertType, alert.alertId]);
  }

  getAllAlerts(page: number, size: number, filters: any)
  {
    this.isLoading = true;
    this.isError = false;

    this.alertService.getAllAlerts(page, size, filters).subscribe(
      (response) => {
        this.isLoading = false;
        this.isError = false;

        this.alertsPage = response;
        this.alertList = JSON.parse(JSON.stringify(response.content));
        this.currentAlertList = JSON.parse(JSON.stringify(response.content));

        if (this.firstCall)
          this.firstCall = false;
      },
      (error) => {
        this.isLoading = false;
        this.isError = true;

      }
    )
  }

  onPageChange(event: any) 
  {
    this.first = event.first;
    this.page = event.page;
    this.size = event.rows;

    this.getAllAlerts(this.page, this.size, this.filterForm.value);
  }

  onClickConfirmDeleteAlerts()
  {
    this.selectedAlerts.forEach((alert) => {
      this.deleteAlert(alert);
    });
  }

  deleteAlert(alert: AlertViewDto)
  {
    this.deleteAlertsMapLoading.set(alert.alertId!, true);
    this.deleteAlertsMapSuccess.set(alert.alertId!, false);
    this.deleteAlertsMapError.set(alert.alertId!, false);

    this.alertService.deleteAlert(alert.alertId!).subscribe(
      (response) => {
        this.deleteAlertsMapLoading.set(alert.alertId!, false);
        this.deleteAlertsMapSuccess.set(alert.alertId!, true);
        this.deleteAlertsMapError.set(alert.alertId!, false);
        this.completedDeletes++;

        if ((this.completedDeletes == this.selectedAlerts.length) && this.failedDeletes == 0)
        {
          this.getAllAlerts(this.page, this.size, this.filterForm.value);
          this.deleteAlertsModalVisible = false;
          this.completedDeletes = 0;
          this.failedDeletes = 0;
          this.selectedAlerts = [];
        }
      },
      (error) => {
        this.deleteAlertsMapLoading.set(alert.alertId!, false);
        this.deleteAlertsMapSuccess.set(alert.alertId!, false);
        this.deleteAlertsMapError.set(alert.alertId!, true);
        this.completedDeletes++;
        this.failedDeletes++;
      }
    )
  }

  deleteAlertsLoading(): boolean
  {
    for (const value of this.deleteAlertsMapLoading.values()) 
    {
      if (value) 
      {
        return true;
      }
    }

    return false;
  }

  allSelectedAlertsHaveDolphinError(): boolean
  {
    for (const alert of this.selectedAlerts)
    {
      if (alert.status != 'DOLPHIN_ERROR')
      {
        return false;
      }
    }

    return true;
  }

  onClickConfirmRecreateAlerts()
  {
    this.selectedAlerts.forEach((alert) => {
      this.recreateAlert(alert);
    });
  }

  recreateAlert(alert: AlertViewDto)
  {
    this.recreateAlertsMapLoading.set(alert.alertId!, true);
    this.recreateAlertsMapSuccess.set(alert.alertId!, false);
    this.recreateAlertsMapError.set(alert.alertId!, false);

    this.alertService.recreateAlert(alert.alertId!).subscribe(
      (response) => {

        if (response.status == 'DOLPHIN_ERROR')
        {
          this.recreateAlertsMapLoading.set(alert.alertId!, false);
          this.recreateAlertsMapSuccess.set(alert.alertId!, false);
          this.recreateAlertsMapError.set(alert.alertId!, true);
          this.failedRecreates++;
        }
        else
        {
          this.recreateAlertsMapLoading.set(alert.alertId!, false);
          this.recreateAlertsMapSuccess.set(alert.alertId!, true);
          this.recreateAlertsMapError.set(alert.alertId!, false);
        }
        
        this.completedRecreates++;

        if ((this.completedRecreates == this.selectedAlerts.length) && this.failedRecreates == 0)
        {
          this.getAllAlerts(this.page, this.size, this.filterForm.value);
          this.recreateAlertModalVisible = false;
          this.completedRecreates = 0;
          this.failedRecreates = 0;
          this.selectedAlerts = [];
        }
      },
      (error) => {
        this.recreateAlertsMapLoading.set(alert.alertId!, false);
        this.recreateAlertsMapSuccess.set(alert.alertId!, false);
        this.recreateAlertsMapError.set(alert.alertId!, true);
        this.completedRecreates++;
        this.failedRecreates++;
      }
    )
  }

  recreateAlertsLoading(): boolean
  {
    for (const value of this.recreateAlertsMapLoading.values()) 
    {
      if (value) 
      {
        return true;
      }
    }

    return false;
  }

  getServices()
  {
    this.metadataService.getServices().subscribe(
      (response) => {
        this.servicesList = response;
      },
      (error) => {

      }
    );
  }

  getSources()
  {
    this.metadataService.getSources().subscribe(
      (response) => {
        this.sourcesList = response;
      },
      (error) => {

      }
    );
  }

  getDataTypes()
  {
    this.metadataService.getDataTypes().subscribe(
      (response) => {
        this.dataTypesList = response;
      },
      (error) => {

      }
    );
  }

  getCategories()
  {
    this.metadataService.getCategories().subscribe(
      (response) => {
        this.categoriesList = response;
      },
      (error) => {

      }
    );
  }

  showToast(type: string, summary: string, detail: string) 
  {
    this.messageService.add({ severity: type, summary: summary, detail: detail, sticky: true });
  }
}
