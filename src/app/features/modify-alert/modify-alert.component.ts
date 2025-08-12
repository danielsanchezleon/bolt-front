import { Component, OnInit } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { testAlerts } from '../../shared/constants/test-alerts';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
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
import { SelectModule } from 'primeng/select';
import { thresholdTypeOptions, thresholdComparationOptions } from '../../shared/constants/threshold-options';
import { modifyAlertTimeWindowOptions, periodicityOptions } from '../../shared/constants/metric-options';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AlertService } from '../../shared/services/alert.service';
import { AlertViewDto } from '../../shared/dto/alert/AlertViewDto';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-modify-alert',
  imports: [FormsModule, SelectModule, PopoverModule, ReactiveFormsModule, InputNumberModule, MultiSelectModule, FloatLabelModule, InputTextModule, InputIconModule, IconFieldModule, MenuModule, TableModule, CommonModule, ButtonModule, PageWrapperComponent],
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
    ])
  ]
})
export class ModifyAlertComponent implements OnInit
{
  filterTextControl: FormControl = new FormControl('');

  alertList: AlertViewDto[] = [];
  alertListFiltered: AlertViewDto[] = [];

  filterPanelOpen: boolean = false;

  thresholdTypeOptions: any[] = [];
  thresholdComparationOptions: any[] = [];

  modifyAlertTimeWindowOptions: any[] = [];
  periodicityOptions: any[] = [];

  tagForm: FormGroup;

  filterForm: FormGroup;

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
    this.getAllAlerts('');

    this.filterTextControl.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(
      (filterText) => 
      {
        console.log(filterText)
        if (filterText.length > 2)
        {
          this.getAllAlerts(filterText);
        }
      }
    );

    this.thresholdTypeOptions = thresholdTypeOptions;
    this.thresholdComparationOptions = thresholdComparationOptions;

    this.modifyAlertTimeWindowOptions = modifyAlertTimeWindowOptions;
    this.periodicityOptions = periodicityOptions;
  }

  onClickNavigateToHome() {
    this.router.navigate(['']);
  }

  onClickAddTag(testAlert: any) {
    testAlert.definedTags.push({ name: this.tagForm.get('name')?.value, value: this.tagForm.get('value')?.value });

    this.tagForm.reset();
    this.tagForm.updateValueAndValidity();
  }

  onClickRemoveTag(testAlert: any, i: number) {
    testAlert.definedTags.splice(i, 1);
  }

  clearIndividualFilters() {
    this.filterForm.reset();
    this.filterForm.updateValueAndValidity();

    this.applyIndividualFilters();
  }

  applyIndividualFilters() 
  {
    const filters = this.filterForm.value;

    this.alertListFiltered = this.alertList.filter((alert) => 
    {
      const matchesName =
        !filters.name || alert.name!.toLowerCase().includes(filters.name.toLowerCase());

      const matchesMessage =
        !filters.message || alert.alertText!.toLowerCase().includes(filters.message.toLowerCase());

      const matchesTimeWindow =
        !filters.timeWindow || alert.evaluationFrequency! === filters.timeWindow;

      const matchesPeriodicity =
        !filters.periodicity || alert.evaluationPeriod! === filters.periodicity;

      return matchesName && matchesMessage && matchesTimeWindow && matchesPeriodicity;
    });
  }

  getAllAlerts(filterText: string)
  {
    this.alertService.getAllAlerts(filterText).subscribe(
      (response) => {
        this.alertList = response;
        this.alertListFiltered = response;
      },
      (error) => {

      }
    )
  }
}
