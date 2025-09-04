import { Component, OnInit } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
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
import { thresholdTypeOptions, thresholdComparationOptions } from '../../shared/constants/threshold-options';
import { modifyAlertTimeWindowOptions, periodicityOptions } from '../../shared/constants/metric-options';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AlertService } from '../../shared/services/alert.service';
import { AlertViewDto } from '../../shared/dto/alert/AlertViewDto';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { AlertConditionViewDto } from '../../shared/dto/alert/AlertConditionViewDto';
import { AlertClauseViewDto } from '../../shared/dto/alert/AlertClauseViewDto';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-modify-alert',
  imports: [FormsModule, TextareaModule, SelectModule, PopoverModule, ReactiveFormsModule, InputNumberModule, MultiSelectModule, FloatLabelModule, InputTextModule, InputIconModule, IconFieldModule, MenuModule, TableModule, CommonModule, ButtonModule, PageWrapperComponent, SkeletonModule, ModalComponent],
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
  alertList: AlertViewDto[] = [];
  currentAlertList: AlertViewDto[] = [];
  changedAlerts: AlertViewDto[] = [];

  filterPanelOpen: boolean = false;

  modifyAlertTimeWindowOptions: any[] = [];
  periodicityOptions: any[] = [];

  tagForm: FormGroup;

  filterForm: FormGroup;

  selectedAlerts: AlertViewDto[] = [];

  saveChangesModalVisible: boolean = false;

  saveChangesMapLoading: Map<number, boolean> = new Map();
  saveChangesMapSuccess: Map<number, boolean> = new Map();
  saveChangesMapError: Map<number, boolean> = new Map();

  failedUpdates: number = 0;
  completedUpdates: number = 0;

  alertMessageEdited: AlertViewDto | null = null;
  newAlertMessage: string = '';

  constructor(private router: Router, private _fb: FormBuilder, private alertService: AlertService) {
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
    this.getAllAlerts(null);

    this.filterTextControl.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(
      (filterText) => 
      {
        if (filterText.length == 0)
        {
          this.getAllAlerts(null);
        }

        if (filterText.length > 2)
        {
          this.getAllAlerts(filterText);
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

  getAllAlerts(filterText: string | null)
  {
    this.isLoading = true;
    this.isError = false;

    this.alertService.getAllAlerts(filterText).subscribe(
      (response) => {
        this.isLoading = false;
        this.isError = false;
        this.alertList = JSON.parse(JSON.stringify(response));
        this.currentAlertList = JSON.parse(JSON.stringify(response));
      },
      (error) => {
        this.isLoading = false;
        this.isError = true;

      }
    )
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
    newCondition.alertClauses?.push(new AlertClauseViewDto(null, alert.indicators![0].id!, null, 'MORE_THAN', null, null, 1, null, null, null, null));

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
          this.getAllAlerts('');
          this.saveChangesModalVisible = false;
          this.completedUpdates = 0;
          this.failedUpdates = 0;
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
}
