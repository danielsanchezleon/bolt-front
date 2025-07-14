import { Component } from '@angular/core';
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
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { thresholdTypeOptions, thresholdComparationOptions } from '../../shared/constants/threshold-options';
import { timeWindowOptions, periodicityOptions } from '../../shared/constants/metric-options';

@Component({
  selector: 'app-modify-alert',
  imports: [FormsModule, SelectModule, PopoverModule, ReactiveFormsModule, InputNumberModule, MultiSelectModule, FloatLabelModule, InputTextModule, InputIconModule, IconFieldModule, MenuModule, TableModule, CommonModule, ButtonModule, PageWrapperComponent],
  templateUrl: './modify-alert.component.html',
  styleUrl: './modify-alert.component.scss'
})
export class ModifyAlertComponent 
{
  testAlerts: any[] = [];
  filteredTestAlerts: any[] = [];
  filterPanelOpen: boolean = false;

  thresholdTypeOptions: any[] = [];
  thresholdComparationOptions: any[] = [];

  timeWindowOptions: any[] = [];
  periodicityOptions: any[] = [];

  tagForm: FormGroup;

  constructor(private router: Router, private _fb: FormBuilder) 
  {
    this.tagForm = this._fb.group({
      name: ['', [Validators.required]],
      value: ['', [Validators.required]]
    });
  }

  ngOnInit()
  {
    this.testAlerts = testAlerts;
    this.filteredTestAlerts = testAlerts;

    this.thresholdTypeOptions = thresholdTypeOptions;
    this.thresholdComparationOptions = thresholdComparationOptions;

    this.timeWindowOptions = timeWindowOptions;
    this.periodicityOptions = periodicityOptions;
  }

  onClickNavigateToHome()
  {
    this.router.navigate(['']);
  }

  applyFilterGlobal($event: any, stringVal: any) 
  {
    const filterValue: string = ($event.target as HTMLInputElement).value.toLowerCase();

    this.filteredTestAlerts = this.testAlerts.filter( (testAlert) =>
        Object.values(testAlert).some(value =>
            String(value).toLowerCase().includes(filterValue)
        )
    );
  }

  onClickAddTag(testAlert: any)
  {
    testAlert.definedTags.push({name: this.tagForm.get('name')?.value, value: this.tagForm.get('value')?.value});

    this.tagForm.reset();
    this.tagForm.updateValueAndValidity();
  }

  onClickRemoveTag(testAlert: any, i: number)
  {
    testAlert.definedTags.splice(i, 1);
  }
}
