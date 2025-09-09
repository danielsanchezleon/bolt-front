import { Component, HostListener, OnInit } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from '../../shared/components/accordion/accordion.component';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { FluidModule } from 'primeng/fluid';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { SanitizeExpressionPipe } from '../../shared/pipes/replace-empty.pipe';
import { FloatLabelModule } from 'primeng/floatlabel';

import { thresholdTypeOptions, thresholdComparationOptions, activationRecoverEvaluationOptions, silencePeriodDayOptions, errorBehaviorOptions } from '../../shared/constants/threshold-options';
import { InputNumberModule } from 'primeng/inputnumber';
import { InnerAccordionComponent } from '../../shared/components/inner-accordion/inner-accordion.component';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { endpointTypeOptions, severityOptions, conditionalBlockOptions, templateVariableOptions } from '../../shared/constants/addressee-options';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';

import { FloatingGraphComponent } from '../../shared/components/floating-graph/floating-graph.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Subscription } from 'rxjs';

import { permissionTeamOptions, permissionTypeOptions } from '../../shared/constants/permission-options';
import { logOptions, logTagOptions, operationOptions, timeWindowOptions, periodicityOptions } from '../../shared/constants/logs';

import { DialogModule } from 'primeng/dialog';

export class Threshold {
  id: string;
  type: string;
  comparation: string;
  value?: number;

  constructor(id: string, type: string, comparation: string, value?: number) {
    this.id = id;
    this.type = type;
    this.comparation = comparation;

    if (value) {
      this.value = value;
    }
  }
}

export class SilencePeriod {
  id: string;
  days?: string[];
  from?: string;
  to?: string;

  constructor(id: string) {
    this.id = id;
    this.days = [];
  }
}

export class Channel {
  id: string;
  channel: string;
  value?: string;
  alerts: string[];

  constructor(id: string) {
    this.id = id;
    this.channel = 'email';
    this.alerts = [];
  }
}

export class Tag {
  name: string;
  value: string;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}

export class Permission {
  team: any;
  type: any;

  constructor() {
    this.type = permissionTypeOptions[0];
  }
}

type ThresholdFormGroup = FormGroup<{
  id: FormControl<string>;
  type: FormControl<any>;
  comparation: FormControl<any>;
  value: FormControl<number | null>;
}>;

type ThresholdFormArray = FormArray<ThresholdFormGroup>;

type SilencePeriodFormGroup = FormGroup<{
  id: FormControl<string>;
  days: FormControl<any[] | null>;
  from: FormControl<string | null>;
  to: FormControl<string | null>;
}>;

type SilencePeriodFormArray = FormArray<SilencePeriodFormGroup>;

type EndpointFormGroup = FormGroup<{
  id: FormControl<string>;
  channel: FormControl<any>;
  value: FormControl<string>;
  alerts: FormControl<any[]>;
}>;

type EndpointFormArray = FormArray<EndpointFormGroup>;

type PermissionFormGroup = FormGroup<{
  id: FormControl<string>;
  team: FormControl<string>;
  permission: FormControl<string>
}>;

@Component({
  selector: 'app-create-logs-alert',
  imports: [DialogModule, PageWrapperComponent, ReactiveFormsModule, ModalComponent, FloatingGraphComponent, TabsModule, TextareaModule, ButtonModule, CommonModule, AccordionComponent, MultiSelectModule, FormsModule, FluidModule, SelectModule, TooltipModule, InputTextModule, FloatLabelModule, InputNumberModule, InnerAccordionComponent, CheckboxModule, DatePickerModule, RadioButtonModule],
  templateUrl: './create-logs-alert.component.html',
  styleUrl: './create-logs-alert.component.scss'
})
export class CreateLogsAlertComponent implements OnInit {
  //General
  subscriptions: Subscription[] = [];

  //Step 1
  logOptions: any[] = [];
  selectedLogOption: any;

  logTagOptions: any[] = [];
  operationOptions: any[] = []

  timeWindowOptions: any[] = [];
  periodicityOptions: any[] = [];

  groupByForm: FormGroup;
  advancedOptionsForm: FormGroup;

  //Step 2
  thresholdTypeOptions: any[] = [];
  thresholdComparationOptions: any[] = [];
  thresholdArray: ThresholdFormArray;

  activationRecoverEvaluationOptions: any[] = [];
  activationRecoverForm: FormGroup;

  silencePeriodDayOptions: any[] = [];
  silencePeriodArray: SilencePeriodFormArray;

  errorBehaviorOptions: any[] = [];
  errorBehaviorForm: FormGroup;

  //Step 3
  endpointTypeOptions: any[] = [];
  severityOptions: any[] = [];
  endpointArray: EndpointFormArray;
  iconMap: Map<string, string> = new Map<string, string>();

  tagForm: FormGroup;
  tagList: Tag[] = [];

  conditionalBlockOptions: any[] = [];
  templateVariableOptions: any[] = [];

  @HostListener('document:click', ['$event']) clickout() { this.messageModalVisible = false; this.detailsModalVisible = false; }
  @HostListener('document:scroll', ['$event']) scrollout() { this.messageModalVisible = false; this.detailsModalVisible = false; }
  messageDialogStyle: any = {};
  detailsDialogStyle: any = {};
  messageModalVisible: boolean = false;
  detailsModalVisible: boolean = false;
  previousMessageValue: string = '';
  previousDetailsValue: string = '';
  notificationMessageForm: FormGroup;

  //Step 4
  permissionTeamOptions: any[] = [];
  permissionTypeOptions: any[] = [];
  permissionList: Permission[] = [];

  //Modal
  modalVisible: boolean = false;

  //Steps
  step2Disabled: boolean = true;
  step3Disabled: boolean = true;
  step4Disabled: boolean = true;

  constructor(private router: Router, private _fb: FormBuilder) {
    //Step 1
    this.groupByForm = this._fb.group({
      groupBy: [[], []],
      operation: new FormControl({value: operationOptions[0], disabled: true}, Validators.required)
    });

    this.advancedOptionsForm = this._fb.group({
      timeWindow: [timeWindowOptions[0], [Validators.required]],
      periodicity: [periodicityOptions[0], [Validators.required]]
    });

    //Step 2
    this.thresholdArray = this._fb.array<ThresholdFormGroup>([]);

    this.activationRecoverForm = this._fb.group({
      activation1: [activationRecoverEvaluationOptions[1], [Validators.required]],
      activation2: [activationRecoverEvaluationOptions[1], [Validators.required]],
      recover1: [activationRecoverEvaluationOptions[1], [Validators.required]],
      recover2: [activationRecoverEvaluationOptions[1], [Validators.required]]
    });

    this.silencePeriodArray = this._fb.array<SilencePeriodFormGroup>([]);

    this.errorBehaviorForm = this._fb.group({
      error1: [errorBehaviorOptions[0], [Validators.required]],
      error2: [errorBehaviorOptions[0], [Validators.required]]
    });

    //Step 3

    this.endpointArray = this._fb.array<EndpointFormGroup>([]);

    this.tagForm = this._fb.group({
      name: ['', [Validators.required]],
      value: ['', [Validators.required]]
    });

    this.notificationMessageForm = this._fb.group({
      message: ['', [Validators.required]],
      details: ['', []],
      proccedure: ['', []]
    });

    let sub: Subscription = this.notificationMessageForm.get('message')?.valueChanges.subscribe(() => {
      this.checkSteps();
    }) as Subscription;

    this.subscriptions.push(sub);
  }

  ngOnInit(): void {
    //Step 1
    this.logOptions = logOptions;

    this.logTagOptions = logTagOptions;
    this.operationOptions = operationOptions;

    this.timeWindowOptions = timeWindowOptions;
    this.periodicityOptions = periodicityOptions;

    //Step 2
    this.thresholdTypeOptions = thresholdTypeOptions;
    this.thresholdComparationOptions = thresholdComparationOptions;
    this.createThreshold();

    this.activationRecoverEvaluationOptions = activationRecoverEvaluationOptions;

    this.silencePeriodDayOptions = silencePeriodDayOptions;
    this.createSilencePeriod();

    this.errorBehaviorOptions = errorBehaviorOptions;

    //Step 3
    this.endpointTypeOptions = endpointTypeOptions;
    this.severityOptions = severityOptions;
    this.createEndpoint();

    for (const option of endpointTypeOptions) {
      this.iconMap.set(option.value, option.icon);
    }

    this.conditionalBlockOptions = conditionalBlockOptions;
    this.templateVariableOptions = templateVariableOptions;

    //Step 4
    this.permissionTeamOptions = permissionTeamOptions;
    this.permissionTypeOptions = permissionTypeOptions;
    this.createPermission();
  }

  createThreshold() {
    const group: ThresholdFormGroup = this._fb.group({
      id: this._fb.control((this.thresholdArray.length + 1).toString()),
      type: this._fb.control(thresholdTypeOptions[0]),
      comparation: this._fb.control(thresholdComparationOptions[0]),
      value: this._fb.control(null, Validators.required)
    }) as ThresholdFormGroup;

    this.thresholdArray.push(group);

    let sub: Subscription = group.get('value')?.valueChanges.subscribe(() => {
      this.checkSteps();
    }) as Subscription;

    this.subscriptions.push(sub);
  }

  firstValueCompleted(): boolean {
    let value = this.thresholdArray.at(0).get('value')?.value;
    return value !== null && value !== undefined;
  }

  allValuesCompleted(): boolean {
    return this.thresholdArray.controls.every(control => {
      let value = control.get('value')?.value;
      return value !== null && value !== undefined;
    });
  }

  createSilencePeriod() {
    const group: SilencePeriodFormGroup = this._fb.group({
      id: this._fb.control((this.silencePeriodArray.length + 1).toString()),
      days: this._fb.control(null),
      from: this._fb.control(null),
      to: this._fb.control(null)
    }) as SilencePeriodFormGroup;

    this.silencePeriodArray.push(group);
  }

  allSilencePeriodFieldsCompleted(): boolean {
    return this.silencePeriodArray.controls.every(control => {
      let days = control.get('days')?.value;
      let from = control.get('from')?.value;
      let to = control.get('to')?.value;

      return days != null && days != undefined && days.length != 0 && from != null && from != undefined && to != null && to != undefined;
    });
  }

  deleteSilencePeriod(i: number) {
    this.silencePeriodArray.removeAt(i);
  }

  createEndpoint() {
    const group: EndpointFormGroup = this._fb.group({
      id: this._fb.control((this.endpointArray.length + 1).toString()),
      channel: this._fb.control(endpointTypeOptions[0]),
      value: this._fb.control('prueba@test.com'),
      alerts: this._fb.control(Array.of())
    }) as EndpointFormGroup;

    this.endpointArray.push(group);
  }

  deleteEndpoint(i: number) {
    this.endpointArray.removeAt(i);
  }

  createPermission() {
    this.permissionList.push(new Permission());
  }

  deletePermission(i: number) {
    this.permissionList.splice(i, 1);
  }

  firstPermissionCompleted(): boolean {
    let team = this.permissionList[0].team;
    return team !== null && team !== undefined;
  }

  allPermissionsCompleted(): boolean {
    return this.permissionList.every(permission => {
      let team = permission.team;
      return team !== null && team !== undefined;
    });
  }

  onClickNavigateToCreateAlert() {
    this.router.navigate(['alert/create']);
  }

  onClickSelectLogOption() {
    this.checkSteps();
  }

  checkSteps() {
    //Step 2
    if (this.selectedLogOption != null && this.selectedLogOption != undefined) {
      this.step2Disabled = false;
    }
    else {
      this.step2Disabled = true;
      this.step3Disabled = true;
      this.step4Disabled = true;
    }

    if ((this.thresholdArray.length == 1 && this.firstValueCompleted()) ||
      (this.thresholdArray.length > 1 && this.allValuesCompleted())) {
      this.step3Disabled = false;
      this.step4Disabled = false;
    }
    else {
      this.step3Disabled = true;
      this.step4Disabled = true;
    }

    if (this.notificationMessageForm.get('message')?.valid) {
      this.step4Disabled = false;
    }
    else {
      this.step4Disabled = true;
    }
  }

  onClickSetThresholdType(threshold: any, type: string) {
    threshold.get('type').setValue(type);
  }

  onClickSetEndpointAlert(endpoint: any, alert: any) {
    let alerts: any[] = endpoint.get('alerts')?.value;

    if (alerts.includes(alert)) {
      alerts = alerts.filter((al) => al !== alert);
    }
    else {
      alerts.push(alert);
    }

    endpoint.get('alerts')?.setValue(alerts);
  }

  onClickAddTag() {
    this.tagList.push(new Tag(this.tagForm.get('name')?.value, this.tagForm.get('value')?.value));

    this.tagForm.reset();
    this.tagForm.updateValueAndValidity();
  }

  onClickRemoveTag(i: number) {
    this.tagList.splice(i, 1);
  }

  onClickCreateAlert() {
    this.modalVisible = true;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  verifyMessageText(value: string, messageInput: HTMLElement)
  {
    let messageInputRect = messageInput.getBoundingClientRect();

    const isOpeningDoubleBraces = value.length > this.previousMessageValue.length && value.endsWith('{{') && !this.previousMessageValue.endsWith('{{');

    // Comparar el valor anterior con el nuevo
    if (isOpeningDoubleBraces) 
    {
      this.messageDialogStyle = 
      {
        position: 'fixed',
        top: messageInputRect.bottom + 'px',
        left: messageInputRect.left + 'px',
        width: '300px'
      }

      this.messageModalVisible = true;
    }
    else
    {
      this.messageModalVisible = false;
    }

    // Guardar el valor actual como "anterior" para la próxima comparación
    this.previousMessageValue = value;
  }

  verifyDetailsText(value: string, detailsInput: HTMLElement)
  {
    let detailsInputRect = detailsInput.getBoundingClientRect();

    const isOpeningDoubleBraces = value.length > this.previousDetailsValue.length && value.endsWith('{{') && !this.previousDetailsValue.endsWith('{{');

    // Comparar el valor anterior con el nuevo
    if (isOpeningDoubleBraces) 
    {
      this.detailsDialogStyle = 
      {
        position: 'fixed',
        top: detailsInputRect.bottom + 'px',
        left: detailsInputRect.left + 'px',
        width: '300px'
      }

      this.detailsModalVisible = true;
    }
    else
    {
      this.detailsModalVisible = false;
    }

    // Guardar el valor actual como "anterior" para la próxima comparación
    this.previousDetailsValue = value;
  }

  onClickAddConditionalBlockToMessage(i: number)
  {
    this.notificationMessageForm.get('message')?.setValue(this.notificationMessageForm.get('message')?.value + conditionalBlockOptions[i].label + '}\n\n{{/' +  conditionalBlockOptions[i].value + '}}');
  }

  onClickAddTemplateVariableToMessage(i: number)
  {
    this.notificationMessageForm.get('message')?.setValue(this.notificationMessageForm.get('message')?.value + templateVariableOptions[i].value + '}}');
  }

  onClickAddConditionalBlockToDetails(i: number)
  {
    this.notificationMessageForm.get('details')?.setValue(this.notificationMessageForm.get('details')?.value + conditionalBlockOptions[i].label + '}\n\n{{/' +  conditionalBlockOptions[i].value + '}}');
  }

  onClickAddTemplateVariableToDetails(i: number)
  {
    this.notificationMessageForm.get('details')?.setValue(this.notificationMessageForm.get('details')?.value + templateVariableOptions[i].value + '}}');
  }
}
