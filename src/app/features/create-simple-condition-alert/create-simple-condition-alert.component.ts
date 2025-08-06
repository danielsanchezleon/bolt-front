import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from '../../shared/components/accordion/accordion.component';
import { Router } from '@angular/router';
import { MetricOptions, metricOperationOptions, operationOptions, timeWindowOptions, discardTimeOptions, periodicityOptions } from '../../shared/constants/metric-options';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { MultiSelectChangeEvent, MultiSelectFilterEvent, MultiSelectModule } from 'primeng/multiselect';
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
import { channelOptions, alertOptions, conditionalBlockOptions, templateVariableOptions } from '../../shared/constants/addressee-options';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { FloatingGraphComponent } from '../../shared/components/floating-graph/floating-graph.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { permissionTeamOptions, permissionTypeOptions } from '../../shared/constants/permission-options';
import { DialogModule } from 'primeng/dialog';
import { MetricService } from '../../shared/services/metric.service';
import { TableMetricInfo } from '../../shared/models/TableMetricInfo';
import { SkeletonModule } from 'primeng/skeleton';
import { AlertClauseDto } from '../../shared/dto/AlertClauseDto';
import { AlertConditionDto } from '../../shared/dto/AlertConditionDto';
import { AlertConditionHistoryDto } from '../../shared/dto/AlertConditionHistoryDto';
import { AlertDto } from '../../shared/dto/AlertDto';
import { AlertIndicatorDto } from '../../shared/dto/AlertIndicatorDto';
import { AlertMetricDto } from '../../shared/dto/AlertMetricDto';
import { AlertPermissionDto } from '../../shared/dto/AlertPermissionDto';
import { AlertSilenceDto } from '../../shared/dto/AlertSilenceDto';
import { ConditionFilterDto } from '../../shared/dto/ConditionFilterDto';
import { EndpointAlertDto } from '../../shared/dto/EndpointAlertDto';
import { EndpointDto } from '../../shared/dto/EndpointDto';
import { FilterLogDto } from '../../shared/dto/FilterLogDto';
import { AlertService } from '../../shared/services/alert.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

export class MetricOption {
  id: string;
  metric: TableMetricInfo;
  operation: any = { value: 0, label: 'Sumar ( + )', symbol: '+', description: 'Sumar con la métrica anterior' };
  order: number;

  constructor(id: string, metric: TableMetricInfo, order: number) {
    this.id = id;
    this.metric = metric;
    this.order = order;
  }
}

export class Threshold {
  id: string;
  type: string;
  comparation: string;
  order: number;
  value?: number;

  constructor(id: string, type: string, comparation: string, order: number, value?: number) {
    this.id = id;
    this.type = type;
    this.comparation = comparation;
    this.order = order;

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
  order: FormControl<number>;
  value: FormControl<number | null>;
  minIncluded: FormControl<boolean>;
  min: FormControl<number | null>;
  maxIncluded: FormControl<boolean>;
  max: FormControl<number | null>;
  status: FormControl<boolean>;
}>;

type ThresholdFormArray = FormArray<ThresholdFormGroup>;

type SilencePeriodFormGroup = FormGroup<{
  id: FormControl<string>;
  days: FormControl<any[] | null>;
  from: FormControl<Date | null>;
  to: FormControl<Date | null>;
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
  selector: 'app-create-simple-condition-alert',
  imports: [ToggleSwitchModule, SkeletonModule, DialogModule, PageWrapperComponent, ReactiveFormsModule, ModalComponent, FloatingGraphComponent, TabsModule, TextareaModule, ButtonModule, CommonModule, AccordionComponent, MultiSelectModule, FormsModule, FluidModule, SelectModule, TooltipModule, InputTextModule, SanitizeExpressionPipe, FloatLabelModule, InputNumberModule, InnerAccordionComponent, CheckboxModule, DatePickerModule, RadioButtonModule],
  templateUrl: './create-simple-condition-alert.component.html',
  styleUrl: './create-simple-condition-alert.component.scss'
})
export class CreateSimpleConditionAlertComponent implements OnInit {
  //General
  subscriptions: Subscription[] = [];

  //Step 1
  filterValue: string = "";
  private filterSubject = new Subject<string>();
  loadingAllMetricList: boolean = false;
  loadingMetricList: boolean = false;

  metricOptions: MetricOptions = new MetricOptions();
  metricOperationOptions: any[] = [];
  metricList: TableMetricInfo[] = [];
  selectedMetricList: TableMetricInfo[] = [];
  selectedMetrics: MetricOption[] = [];
  letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  customizeMetric: boolean = false;
  resultMetric: string = '';
  resultMetricLabel: string = '';

  tagIntersectionOptions: any[] = [];
  operationOptions: any[] = []

  dimensionValuesMap: Map<string, string[]> = new Map();
  selectedDimensionValuesMap: Map<string, Map<string, string[]>> = new Map();

  timeWindowOptions: any[] = [];
  discardTimeOptions: any[] = [];
  periodicityOptions: any[] = [];

  groupByForm: FormGroup;
  advancedOptionsForm: FormGroup;

  //Step 2
  thresholdTypeOptions: any[] = [];
  thresholdComparationOptions: any[] = [];
  thresholdArray: ThresholdFormArray;
  lastThresholdArrayLength: number = 0;

  activationRecoverEvaluationOptions: any[] = [];
  activationRecoverForm: FormGroup;

  silencePeriodDayOptions: any[] = [];
  silencePeriodArray: SilencePeriodFormArray;

  errorBehaviorOptions: any[] = [];
  errorBehaviorForm: FormGroup;

  //Step 3
  channelOptions: any[] = [];
  alertOptions: any[] = [];
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
  isDetails: boolean = false;
  isLoading: boolean = false;
  isSuccess: boolean = false;
  isError: boolean = false;

  //Steps
  step2Disabled: boolean = true;
  step3Disabled: boolean = true;
  step4Disabled: boolean = true;

  constructor(
    private router: Router,
    private _fb: FormBuilder,
    private metricService: MetricService,
    private alertService: AlertService) {
    //Step 1
    this.groupByForm = this._fb.group({
      groupBy: [[], []],
      operation: [operationOptions[0], []]
    });

    this.advancedOptionsForm = this._fb.group({
      timeWindow: [timeWindowOptions[1], [Validators.required]],
      discardTime: [discardTimeOptions[0], [Validators.required]],
      periodicity: [periodicityOptions[1], [Validators.required]]
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

    // this.getAllMetrics();

    this.filterSubject
      .pipe(debounceTime(1000)) // Espera 1 segundo desde la última tecla
      .subscribe(filtro => {
        this.getMetrics(filtro);
      });

    this.metricOperationOptions = metricOperationOptions;

    this.operationOptions = operationOptions;

    this.timeWindowOptions = timeWindowOptions;
    this.discardTimeOptions = discardTimeOptions;
    this.periodicityOptions = periodicityOptions;

    //Step 2
    this.thresholdTypeOptions = thresholdTypeOptions;
    this.thresholdComparationOptions = thresholdComparationOptions;
    this.createThreshold();
    this.selectedDimensionValuesMap.set('1', new Map());

    this.activationRecoverEvaluationOptions = activationRecoverEvaluationOptions;

    this.silencePeriodDayOptions = silencePeriodDayOptions;
    this.createSilencePeriod();

    this.errorBehaviorOptions = errorBehaviorOptions;

    //Step 3
    this.channelOptions = channelOptions;
    this.alertOptions = alertOptions;
    this.createEndpoint();

    for (const option of channelOptions) {
      this.iconMap.set(option.value, option.icon);
    }

    this.conditionalBlockOptions = conditionalBlockOptions;
    this.templateVariableOptions = templateVariableOptions;

    //Step 4
    this.permissionTeamOptions = permissionTeamOptions;
    this.permissionTypeOptions = permissionTypeOptions;
    this.createPermission();

    // this.thresholdArray.valueChanges.subscribe((thresholds) => {
    //   if (this.lastThresholdArrayLength != this.thresholdArray.length)
    //   {
    //     this.lastThresholdArrayLength = this.thresholdArray.length;
      
    //     this.selectedDimensionValuesMap.clear();
    //     thresholds.forEach((threshold: any) => {
    //       this.selectedDimensionValuesMap.set(threshold.id, new Map());
    //     });
    //   }
    // });
  }

  watchGroupValidity(group: ThresholdFormGroup) {
    const fields = ['value', 'min', 'minIncluded', 'max', 'maxIncluded'];

    fields.forEach(fieldName => {
      const control = group.get(fieldName);
      if (control) {
        const sub = control.valueChanges.subscribe(() => {
          group.updateValueAndValidity({ onlySelf: true, emitEvent: false });
          this.checkSteps(); // <- fuerza revalidación general
        });
        this.subscriptions.push(sub);
      }
    });
  }

  createThreshold() {
    const group: ThresholdFormGroup = this._fb.group({
      id: this._fb.control((this.thresholdArray.length + 1).toString()),
      type: this._fb.control(thresholdTypeOptions[0]),
      comparation: this._fb.control(thresholdComparationOptions[0]),
      order: this._fb.control(this.thresholdArray.length + 1),
      value: this._fb.control(null),
      minIncluded: this._fb.control(true),
      min: this._fb.control(null),
      maxIncluded: this._fb.control(true),
      max: this._fb.control(null),
      status: this._fb.control(true)
    }) as ThresholdFormGroup;

    this.thresholdArray.push(group);

    this.selectedDimensionValuesMap.set(group.get('id')?.value!, new Map());

    this.watchGroupValidity(group);

    // Suscripción para ajustar validadores dinámicamente
    const comparationControl = group.get('comparation');
    const dynamicValidationSub = comparationControl?.valueChanges.subscribe((comp: any) => {
      const valueControl = group.get('value');
      const minControl = group.get('min');
      const minIncludedControl = group.get('minIncluded');
      const maxControl = group.get('max');
      const maxIncludedControl = group.get('maxIncluded');

      if (comp.value === 0 || comp.value === 1) {
        // Solo "value" requerido
        valueControl?.setValidators(Validators.required);
        minControl?.clearValidators();
        maxControl?.clearValidators();
        minIncludedControl?.clearValidators();
        maxIncludedControl?.clearValidators();
      } else if (comp.value === 2 || comp.value === 3) {
        // Solo rango requerido
        valueControl?.clearValidators();
        minControl?.setValidators(Validators.required);
        maxControl?.setValidators(Validators.required);
        minIncludedControl?.setValidators(Validators.required);
        maxIncludedControl?.setValidators(Validators.required);
      }

      // Importante: actualizar validación
      valueControl?.updateValueAndValidity();
      minControl?.updateValueAndValidity();
      maxControl?.updateValueAndValidity();
      minIncludedControl?.updateValueAndValidity();
      maxIncludedControl?.updateValueAndValidity();

      this.checkSteps();

    }) as Subscription;

    this.subscriptions.push(dynamicValidationSub);

    // Ejecutar validación inicial según el valor inicial
    comparationControl?.updateValueAndValidity();

    this.lastThresholdArrayLength = this.thresholdArray.length;
  }

  allValuesCompleted(): boolean {
    return this.thresholdArray.controls.every(group => {
      return group.valid;
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
      channel: this._fb.control(channelOptions[0]),
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

  private allowedLetters(): string[] {
    let letters = [];

    for (let i = 0; i < this.selectedMetrics.length; i++) {
      letters.push(this.letters[i]);
    }

    return letters;
  }

  private get allowedChars(): string[] {
    return ['+', '-', '*', '/', '(', ')', ...this.allowedLetters()];
  }

  allowCharacters(event: KeyboardEvent) {
    const char = event.key;

    if (!this.allowedChars.includes(char)) {
      event.preventDefault();
    }
  }

  onClickNavigateToCreateAlert() {
    this.router.navigate(['crear-alerta']);
  }

  onClickSelectMetrics() {
    let offset: number = this.selectedMetrics.length;

    this.selectedMetricList.forEach((selectedMetric, i) => {
      this.selectedMetrics.push(new MetricOption(this.letters[offset + i], selectedMetric, (i + 1)));
    });

    this.metricList = this.metricList.filter(metricA => !this.selectedMetricList.some(metricB => metricB.metric === metricA.metric));

    this.selectedMetricList = [];

    this.checkSteps();
    this.generateResultMetric();
    this.getMetricTagsIntersection();

    this.dimensionValuesMap.clear();

    this.selectedMetrics.forEach((metric) => {
      metric.metric.dimension.forEach((dimension) => {
        this.getDimensionValues(metric.metric.bbdd, metric.metric.table_name, metric.metric.metric, dimension);
      });
    });
  }

  generateResultMetric() {
    this.resultMetric = '';
    this.resultMetricLabel = '';

    this.selectedMetrics.forEach((selectedMetric, i) => {
      this.resultMetric += selectedMetric.id;
      this.resultMetricLabel += selectedMetric.metric.metric;

      if (i < (this.selectedMetrics.length - 1)) {
        this.resultMetric += this.selectedMetrics[i + 1].operation.symbol;
        this.resultMetricLabel += ' ' + this.selectedMetrics[i + 1].operation.symbol + ' ';
      }
    });
  }

  getMetricTagsIntersection() {
    let commonTags = new Set(this.selectedMetrics[0].metric.dimension);

    for (let selectedMetric of this.selectedMetrics.slice(1)) {
      commonTags = new Set(selectedMetric.metric.dimension.filter(dim => commonTags.has(dim)));
    }

    this.tagIntersectionOptions = Array.from(commonTags).map(tag => ({ label: tag, value: tag }));
  }

  onClickRemoveSelectedMetric(index: number) {

    this.metricList.push(this.selectedMetrics[index].metric);

    this.selectedMetrics.splice(index, 1);

    this.selectedMetrics.forEach((selectedMetric, i) => {
      selectedMetric.id = this.letters[i];
    });

    this.checkSteps();

    if (this.selectedMetrics.length > 0) {
      this.generateResultMetric();
      this.getMetricTagsIntersection();
    }
  }

  onClickArrowDown(index: number) {
    [this.selectedMetrics[index], this.selectedMetrics[index + 1]] = [this.selectedMetrics[index + 1], this.selectedMetrics[index]];

    let orderAux: number = this.selectedMetrics[index].order;
    this.selectedMetrics[index].order = this.selectedMetrics[index + 1].order;
    this.selectedMetrics[index + 1].order = orderAux;

    this.selectedMetrics.forEach((selectedMetric, i) => {
      selectedMetric.id = this.letters[i];
    });

    this.checkSteps();
    this.generateResultMetric();
  }

  onClickArrowUp(index: number) {
    [this.selectedMetrics[index], this.selectedMetrics[index - 1]] = [this.selectedMetrics[index - 1], this.selectedMetrics[index]];

    let orderAux: number = this.selectedMetrics[index].order;
    this.selectedMetrics[index].order = this.selectedMetrics[index - 1].order;
    this.selectedMetrics[index - 1].order = orderAux;

    this.selectedMetrics.forEach((selectedMetric, i) => {
      selectedMetric.id = this.letters[i];
    });

    this.checkSteps();
    this.generateResultMetric();
  }

  checkSteps() {
    //Step 2
    if (this.selectedMetrics.length > 0) {
      this.step2Disabled = false;
    }
    else {
      this.step2Disabled = true;
      this.step3Disabled = true;
      this.step4Disabled = true;
    }

    if (this.allValuesCompleted()) {
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

  onClickCustomizeMetric() {
    this.customizeMetric = true;
  }

  onChangeSelectOperation() {
    this.generateResultMetric();
  }

  onClickSaveMetric() {
    this.customizeMetric = false;
  }

  onClickCancelMetricCustomization() {
    this.generateResultMetric();
    this.customizeMetric = false;
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

  verifyMessageText(value: string, messageInput: HTMLElement) {
    let messageInputRect = messageInput.getBoundingClientRect();

    const isOpeningDoubleBraces = value.length > this.previousMessageValue.length && value.endsWith('{{') && !this.previousMessageValue.endsWith('{{');

    // Comparar el valor anterior con el nuevo
    if (isOpeningDoubleBraces) {
      this.messageDialogStyle =
      {
        position: 'fixed',
        top: messageInputRect.bottom + 'px',
        left: messageInputRect.left + 'px',
        width: '300px'
      }

      this.messageModalVisible = true;
    }
    else {
      this.messageModalVisible = false;
    }

    // Guardar el valor actual como "anterior" para la próxima comparación
    this.previousMessageValue = value;
  }

  verifyDetailsText(value: string, detailsInput: HTMLElement) {
    let detailsInputRect = detailsInput.getBoundingClientRect();

    const isOpeningDoubleBraces = value.length > this.previousDetailsValue.length && value.endsWith('{{') && !this.previousDetailsValue.endsWith('{{');

    // Comparar el valor anterior con el nuevo
    if (isOpeningDoubleBraces) {
      this.detailsDialogStyle =
      {
        position: 'fixed',
        top: detailsInputRect.bottom + 'px',
        left: detailsInputRect.left + 'px',
        width: '300px'
      }

      this.detailsModalVisible = true;
    }
    else {
      this.detailsModalVisible = false;
    }

    // Guardar el valor actual como "anterior" para la próxima comparación
    this.previousDetailsValue = value;
  }

  onClickAddConditionalBlockToMessage(i: number) {
    this.notificationMessageForm.get('message')?.setValue(this.notificationMessageForm.get('message')?.value + conditionalBlockOptions[i].label + '}\n\n{{/' + conditionalBlockOptions[i].value + '}}');
  }

  onClickAddTemplateVariableToMessage(i: number) {
    this.notificationMessageForm.get('message')?.setValue(this.notificationMessageForm.get('message')?.value + templateVariableOptions[i].value + '}}');
  }

  onClickAddTagTemplateVariableToMessage(i: number) {
    this.notificationMessageForm.get('message')?.setValue(this.notificationMessageForm.get('message')?.value + this.tagIntersectionOptions[i].value + '}}');
  }

  onClickAddConditionalBlockToDetails(i: number) {
    this.notificationMessageForm.get('details')?.setValue(this.notificationMessageForm.get('details')?.value + conditionalBlockOptions[i].label + '}\n\n{{/' + conditionalBlockOptions[i].value + '}}');
  }

  onClickAddTemplateVariableToDetails(i: number) {
    this.notificationMessageForm.get('details')?.setValue(this.notificationMessageForm.get('details')?.value + templateVariableOptions[i].value + '}}');
  }

  getAllMetrics() {
    this.loadingAllMetricList = true;

    this.metricService.getAllMetrics().subscribe(
      (response) => {
        this.metricList = response;
        this.loadingAllMetricList = false;
      },
      (error) => {
        this.loadingAllMetricList = false;
      }
    )
  }

  getMetrics(filter: string) {
    this.loadingMetricList = true;

    this.metricService.getMetrics(filter).subscribe(
      (response) => {
        this.metricList = response;
        this.loadingMetricList = false;
      },
      (error) => {
        this.loadingMetricList = false;
      }
    )
  }

  onFilterMetricsChange(event: MultiSelectFilterEvent) {
    this.filterValue = event.filter

    if (event.filter.length > 2)
      this.filterSubject.next(event.filter);
  }

  onClickConfirmCreateAlert() 
  {
    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;

    //FILTER LOGS
    let filterLogs: FilterLogDto[] = [];

    //PERMISSIONS
    let alertPermissions: AlertPermissionDto[] = [];

    //CONDITION HISTORIES
    let alertConditionHistories: AlertConditionHistoryDto[] = [];

    //ENDPOINTS
    let endpointAlerts: EndpointAlertDto[] = [];

    for (let endpoint of this.endpointArray.controls) {
      let endpointDto: EndpointDto = new EndpointDto(endpoint.get('channel')?.value.label, endpoint.get('channel')?.value.value, endpoint.get('value')?.value!)
      let severities: string[] = [];

      for (let severity of endpoint.get('alerts')?.value!)
      {
        severities.push(severity.value);
      }

      endpointAlerts.push(new EndpointAlertDto(severities, endpointDto))
    }

    //PERIODOS DE SILENCIO
    let alertSilences: AlertSilenceDto[] = [];

    if (this.allSilencePeriodFieldsCompleted())
    {
      for (let silencePeriod of this.silencePeriodArray.controls) {
        let days: any[] = silencePeriod.get('days')?.value!;

        for (let i = 0; i < days.length; i++) {
          let fromHour = silencePeriod.get('from')?.value!.getHours().toString().padStart(2, '0');
          let fromMinutes = silencePeriod.get('from')?.value!.getMinutes().toString().padStart(2, '0');
          let toHour = silencePeriod.get('to')?.value!.getHours().toString().padStart(2, '0');
          let toMinutes = silencePeriod.get('to')?.value!.getMinutes().toString().padStart(2, '0');
          alertSilences.push(new AlertSilenceDto(days[i].value, fromHour+':'+fromMinutes, toHour+':'+toMinutes));
        }
      }
    }

    //METRICAS
    let alertIndicators: AlertIndicatorDto[] = [];
    let alertMetrics: AlertMetricDto[] = [];

    for (let selectedMetric of this.selectedMetrics) {
      alertMetrics.push(new AlertMetricDto(selectedMetric.metric.bbdd, selectedMetric.metric.table_name, selectedMetric.metric.metric, selectedMetric.operation.value, selectedMetric.order));
    }

    alertIndicators.push(new AlertIndicatorDto('A', alertMetrics));

    //UMBRALES
    let alertConditions: AlertConditionDto[] = [];

    for (let threshold of this.thresholdArray.controls) {
      let alertClauses: AlertClauseDto[] = [];
      alertClauses.push(new AlertClauseDto(null, threshold.get('comparation')?.value.value, threshold.get('value')?.value!, null, null, null));

      let conditionFilters: ConditionFilterDto[] = [];
      let dimensionValuesMap: Map<string, string[]> = this.selectedDimensionValuesMap.get(threshold.get('id')?.value!)!;

      for (let key of dimensionValuesMap.keys())
      {
        for (let value of dimensionValuesMap.get(key)!)
        {
          conditionFilters.push(new ConditionFilterDto(key, value));
        }
      }

      alertConditions.push(new AlertConditionDto(threshold.get('type')?.value.value, threshold.get('status')?.value!, alertClauses, conditionFilters));
    }

    //ALERTA
    let alertDto: AlertDto = new AlertDto(
      "",
      "",
      this.notificationMessageForm.get('message')?.value,
      this.notificationMessageForm.get('details')?.value,
      this.tagList,
      this.advancedOptionsForm.get('timeWindow')?.value.value,
      this.advancedOptionsForm.get('periodicity')?.value.value,
      0,
      this.advancedOptionsForm.get('discardTime')?.value.value,
      this.groupByForm.get('groupBy')?.value,
      this.groupByForm.get('operation')?.value.value,
      null,
      this.activationRecoverForm.get('activation1')?.value.value,
      this.activationRecoverForm.get('activation2')?.value.value,
      this.activationRecoverForm.get('recover1')?.value.value,
      this.activationRecoverForm.get('recover2')?.value.value
    );

    alertDto.alertConditions = alertConditions;
    alertDto.alertSilences = alertSilences;
    alertDto.endpointAlerts = endpointAlerts;
    alertDto.alertIndicators = alertIndicators;
    alertDto.alertPermissions = alertPermissions;
    alertDto.alertConditionHistories = alertConditionHistories;
    alertDto.filterLogs = filterLogs;

    this.alertService.createSimpleAlert(alertDto).subscribe(
      (response) => 
      {
        this.isLoading = false;
        this.isSuccess = true;
      },
      (error) =>
      {
        this.isLoading = false;
        this.isError = true;
      }
    )
  }

  onClickRemoveSelectedThreshold(index: number) {

    this.selectedDimensionValuesMap.delete(this.thresholdArray.controls.at(index)?.get('id')?.value!);

    this.thresholdArray.controls.splice(index, 1);

    this.thresholdArray.controls.forEach((threshold, i) => {
      threshold.get('id')?.setValue((i + 1).toString());
    });

    this.checkSteps();
  }

  onClickThresholdArrowDown(index: number) {
    [this.thresholdArray.controls[index], this.thresholdArray.controls[index + 1]] = [this.thresholdArray.controls[index + 1], this.thresholdArray.controls[index]];

    let orderAux: number = this.thresholdArray.controls[index].get('order')?.value!;
    this.thresholdArray.controls[index].get('order')?.setValue(this.thresholdArray.controls[index + 1].get('order')?.value!);
    this.thresholdArray.controls[index + 1].get('order')?.setValue(orderAux);

    this.thresholdArray.controls.forEach((threshold, i) => {
      threshold.get('id')?.setValue((i + 1).toString());
    });

    this.checkSteps();
    this.generateResultMetric();
  }

  onClickThresholdArrowUp(index: number) {
    [this.thresholdArray.controls[index], this.thresholdArray.controls[index - 1]] = [this.thresholdArray.controls[index - 1], this.thresholdArray.controls[index]];

    let orderAux: number = this.thresholdArray.controls[index].get('order')?.value!;
    this.thresholdArray.controls[index].get('order')?.setValue(this.thresholdArray.controls[index - 1].get('order')?.value!);
    this.thresholdArray.controls[index - 1].get('order')?.setValue(orderAux);

    this.thresholdArray.controls.forEach((threshold, i) => {
      threshold.get('id')?.setValue((i + 1).toString());
    });

    this.checkSteps();
    this.generateResultMetric();
  }

  //Dimension values
  getDimensionValues(bbdd: string, table_name: string, metric: string, dimension: string)
  {
    this.alertService.getDimensionValues(bbdd, table_name, metric, dimension).subscribe(
      (response) => {
        if (!this.dimensionValuesMap.has(dimension)) 
        {
          this.dimensionValuesMap.set(dimension, response);
        }
        else
        {
          let existingArray = this.dimensionValuesMap.get(dimension)!;
          const intersection = existingArray.filter(valor => response.includes(valor));
          this.dimensionValuesMap.set(dimension, intersection);
        }
      },
      (error) => {

      }
    )
  }

  onChangeDimensionValuesSelection(threshold: any, dimension: string, event: MultiSelectChangeEvent) 
  {
    let dimensionValuesMap: Map<string, string[]> = this.selectedDimensionValuesMap.get(threshold.get('id')?.value)!;
    dimensionValuesMap.set(dimension, event.value);
    this.selectedDimensionValuesMap.set(threshold.get('id')?.value, dimensionValuesMap);
  }

  onClickGoToCreateAlert()
  {
    this.router.navigate(['crear-alerta']);
  }

  onClickGoToMofifyAlert()
  {
    this.router.navigate(['modificar-alerta']);
  }
}
