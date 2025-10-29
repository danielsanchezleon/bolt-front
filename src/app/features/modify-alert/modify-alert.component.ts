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
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { AlertConditionViewDto } from '../../shared/dto/alert/AlertConditionViewDto';
import { AlertClauseViewDto } from '../../shared/dto/alert/AlertClauseViewDto';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-modify-alert',
  imports: [FormsModule, ToggleSwitchModule, TextareaModule, SelectModule, PopoverModule, ReactiveFormsModule, InputNumberModule, MultiSelectModule, FloatLabelModule, InputTextModule, InputIconModule, IconFieldModule, MenuModule, TableModule, CommonModule, ButtonModule, PageWrapperComponent, SkeletonModule, ModalComponent, PaginatorModule],
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
  ]
})
export class ModifyAlertComponent implements OnInit
{
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

  filterForm: FormGroup;

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

  constructor(private router: Router, private _fb: FormBuilder, private alertService: AlertService, private route: ActivatedRoute) 
  {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { alertId: any };
    if (state?.alertId)
    {
      this.getAllAlerts(this.page, this.size, null, state?.alertId);
    }
    else
    {
      this.getAllAlerts(this.page, this.size, null, null);
    }

    this.tagForm = this._fb.group({
      name: ['', [Validators.required]],
      value: ['', [Validators.required]]
    });

    this.filterForm = this._fb.group({
      name: new FormControl(''),
      message: new FormControl(''),
      timeWindow: new FormControl(null),
      periodicity: new FormControl(null)
    });
  }

  ngOnInit() 
  {
    this.filterTextControl.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(
      (filterText) => 
      {
        if (filterText.length == 0)
        {
          this.getAllAlerts(this.page, this.size, null, null);
        }

        if (filterText.length > 2)
        {
          this.getAllAlerts(this.page, this.size, filterText, null);
        }
      }
    );

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
    this.changedAlerts.forEach((alert) => {
      this.updateAlert(alert);
    });
  }

  updateAlert(alert: AlertViewDto)
  {
    this.saveChangesMapLoading.set(alert.alertId!, true);
    this.saveChangesMapSuccess.set(alert.alertId!, false);
    this.saveChangesMapError.set(alert.alertId!, false);

    this.alertService.updateAlert(alert).subscribe(
      (response) => {
        this.saveChangesMapLoading.set(alert.alertId!, false);
        this.saveChangesMapSuccess.set(alert.alertId!, true);
        this.saveChangesMapError.set(alert.alertId!, false);
        this.completedUpdates++;

        if ((this.completedUpdates == this.changedAlerts.length) && this.failedUpdates == 0)
        {
          this.getAllAlerts(this.page, this.size, '', null);
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

  getAllAlerts(page: number, size: number, filterText: string | null, alertId: number | null)
  {
    this.isLoading = true;
    this.isError = false;

    this.alertService.getAllAlerts(page, size, filterText, alertId).subscribe(
      (response) => {
        this.isLoading = false;
        this.isError = false;

        this.alertsPage = response;
        this.alertList = JSON.parse(JSON.stringify(response.content));
        this.currentAlertList = JSON.parse(JSON.stringify(response.content));
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

    this.getAllAlerts(this.page, this.size, null, null);
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
          this.getAllAlerts(this.page, this.size, '', null);
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
          this.getAllAlerts(this.page, this.size, '', null);
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
}
