import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from '../../shared/components/accordion/accordion.component';
import { Router } from '@angular/router';
import { MetricOptions, metricOperationOptions, operationOptions, timeWindowOptions, discardTimeOptions, periodicityOptions } from '../../shared/constants/metric-options';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, Validators, FormArray, FormControl, AbstractControl, Form } from '@angular/forms';
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
import { endpointTypeOptions, severityOptions, conditionalBlockOptions, templateVariableOptions } from '../../shared/constants/addressee-options';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { FloatingGraphComponent } from '../../shared/components/floating-graph/floating-graph.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { debounceTime, distinctUntilChanged, map, Subject, Subscription, switchMap } from 'rxjs';
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
import { FilterLogDto } from '../../shared/dto/FilterLogDto';
import { AlertService } from '../../shared/services/alert.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { EndpointService } from '../../shared/services/endpoint.service';
import { EndpointViewDto } from '../../shared/dto/endpoint/EndpointViewDto';
import { TeamViewDto } from '../../shared/dto/TeamViewDto';
import { AuthService } from '../../shared/services/auth.service';

export class Endpoint {
  type: any;
  endpoint: any;
  severities: any[];

  constructor(type: any, endpoint: any, severities: any[]) {
    this.type = type;
    this.endpoint = endpoint;
    this.severities = severities;
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

  constructor(team?: TeamViewDto, type?: any) {
    this.team = team;
    this.type = type;
  }
}

class MetricOperation
{
  value: number;
  label: string;
  symbol: string;
  description: string;

  constructor(value: number, label: string, symbol: string, description: string) {
    this.value = value;
    this.label = label;
    this.symbol = symbol;
    this.description = description;
  }
}

type MetricFormGroup = FormGroup<{
  id: FormControl<string>;
  metric: FormControl<TableMetricInfo | null>;
  operation: FormControl<MetricOperation>;
  options: FormControl<TableMetricInfo[]>;
}>;

type IndicatorFormGroup = FormGroup<{
  name: FormControl<string>;
  metrics: FormArray<MetricFormGroup>;
  hasFinalOperation: FormControl<boolean>;
  constantOp: FormControl<MetricOperation | null>;
  constantValue: FormControl<number | null>;
}>;

type IndicatorFormArray = FormArray<IndicatorFormGroup>;

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
  startBrackets: FormControl<number | null>;
  endBrackets: FormControl<number | null>;
  externalOperation: FormControl<string | null>;
}>;

type ThresholdFormArray = FormArray<ThresholdFormGroup>;

type SilencePeriodFormGroup = FormGroup<{
  id: FormControl<string>;
  days: FormControl<any[] | null>;
  from: FormControl<Date | null>;
  to: FormControl<Date | null>;
}>;

type SilencePeriodFormArray = FormArray<SilencePeriodFormGroup>;

@Component({
  selector: 'app-create-simple-condition-alert',
  imports: [ToggleSwitchModule, SkeletonModule, DialogModule, PageWrapperComponent, ReactiveFormsModule, ModalComponent, TabsModule, TextareaModule, ButtonModule, CommonModule, AccordionComponent, MultiSelectModule, FormsModule, FluidModule, SelectModule, TooltipModule, InputTextModule, SanitizeExpressionPipe, FloatLabelModule, InputNumberModule, InnerAccordionComponent, CheckboxModule, DatePickerModule, RadioButtonModule],
  templateUrl: './create-simple-condition-alert.component.html',
  styleUrl: './create-simple-condition-alert.component.scss'
})
export class CreateSimpleConditionAlertComponent implements OnInit {
  //General
  subscriptions: Subscription[] = [];

  //Step 1

  indicatorArray: IndicatorFormArray;
  matOperations: MetricOperation[] = [new MetricOperation(0, 'Sumar ( + )', '+', 'Sumar con la métrica anterior'), new MetricOperation(1, 'Restar ( - )', '-', 'Restar con la métrica anterior'), new MetricOperation(2, 'Multiplicar ( * )', '*', 'Multiplicar con la métrica anterior'), new MetricOperation(3, 'Dividir ( / )', '/', 'Dividir con la métrica anterior')];
  private filterSubject = new Subject<{ term: string, metric: MetricFormGroup & { options?: TableMetricInfo[] } }>();
  loadingMetricList: boolean = false;

  metricList: TableMetricInfo[] = [];
  letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  resultMetric: string = '';

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
  endpointsByTypeMap: any;
  endpointFieldValues: EndpointViewDto[] = [];
  endpointForm: FormGroup;

  endpointList: Endpoint[] = [];

  endpointTypeOptions: any[] = [];
  severityOptions: any[] = [];

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
  permissionTypeOptions: any[] = [];
  permissionList: Permission[] = [];
  teamList: TeamViewDto[] = [];

  //Modal
  modalVisible: boolean = false;
  isDetails: boolean = false;
  isLoading: boolean = false;
  isSuccess: boolean = false;
  isError: boolean = false;

  constructor(
    private router: Router,
    private _fb: FormBuilder,
    private metricService: MetricService,
    private alertService: AlertService,
    private endpointService: EndpointService,
    private authService: AuthService) {
    //Step 1
    this.indicatorArray = this._fb.array<IndicatorFormGroup>([]);

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

    this.endpointForm = this._fb.group({
      type: ['', [Validators.required]],
      endpoint: [{value: '', disabled: true}, [Validators.required]],
      severities: [{value: [], disabled: true}, [Validators.required]]
    });

    this.tagForm = this._fb.group({
      name: ['', [Validators.required]],
      value: ['', [Validators.required]]
    });

    this.notificationMessageForm = this._fb.group({
      message: ['', [Validators.required]],
      details: ['', []],
      proccedure: ['', []]
    });
  }

  ngOnInit(): void {
    //Step 1

    this.createIndicator();

    this.filterSubject
      .pipe(
        debounceTime(1000), // Espera 1 segundo desde la última tecla
        switchMap(({ term, metric }) => { 
          this.loadingMetricList = true;
          return this.metricService.getMetrics(term).pipe(
            map(response => ({ response, metric }))
          );
        })
      )
      .subscribe(({ response, metric }) => {
        metric.get('options')?.setValue(response);
        this.loadingMetricList = false;
      });


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
    this.getEndpointsByType();

    this.endpointTypeOptions = endpointTypeOptions;
    this.severityOptions = severityOptions;

    this.conditionalBlockOptions = conditionalBlockOptions;
    this.templateVariableOptions = templateVariableOptions;

    //Step 4
    this.permissionTypeOptions = permissionTypeOptions;
    this.getAllTeams();
  }

  createIndicator()
  {
    let indicatorIndex: number = this.indicatorArray.length;

    const group: IndicatorFormGroup = this._fb.group({
      name: this._fb.control(this.letters[indicatorIndex]),
      metrics: this._fb.array<MetricFormGroup>([]),
      hasFinalOperation: this._fb.control(false),
      constantOp: this._fb.control(this.matOperations[2]),
      constantValue: this._fb.control(100)
    }) as IndicatorFormGroup;

    this.indicatorArray.push(group);

    this.createMetric(indicatorIndex);
  }

  removeIndicator(indicatorIndex: number)
  {
    this.indicatorArray.removeAt(indicatorIndex);

    for (let indicator of this.indicatorArray.controls)
    {
      indicator.get('name')?.setValue(this.letters[this.indicatorArray.controls.indexOf(indicator)]);
    }

    this.getMetricTagsIntersection();
  }

  createMetric(indicatorIndex: number)
  {
    this.indicatorArray.at(indicatorIndex).controls.metrics.push(this._fb.group({
      id: this._fb.control((this.indicatorArray.at(indicatorIndex).controls.metrics.length! + 1).toString()),
      metric: this._fb.control(null),
      operation: this._fb.control(this.matOperations[0]),
      options: this._fb.control([] as TableMetricInfo[])
    }) as MetricFormGroup);

    this.indicatorArray.at(indicatorIndex).get('hasFinalOperation')?.setValue(false);
  }

  removeMetric(indicatorIndex: number, metricIndex: number)
  {
    this.indicatorArray.at(indicatorIndex).controls.metrics.removeAt(metricIndex);

    for (let metric of this.indicatorArray.at(indicatorIndex).controls.metrics.controls)
    {
      metric.get('id')?.setValue((this.indicatorArray.at(indicatorIndex).controls.metrics.controls.indexOf(metric) + 1).toString());
    }

    this.getMetricTagsIntersection();

    this.indicatorArray.at(indicatorIndex).get('hasFinalOperation')?.setValue(false);
  }

  onChangeMetricSelect(indicatorIndex: number)
  {
    this.generateResultMetric(indicatorIndex);

    this.getMetricTagsIntersection();

    this.dimensionValuesMap.clear();

    for (const indicator of this.indicatorArray.controls) 
    {
      const metricsArray = indicator.controls.metrics;

      for (const metricGroup of metricsArray.controls) 
      {
        const metricValue = metricGroup.get('metric')?.value;

        if (metricValue && Array.isArray(metricValue.dimension)) 
        {
          metricValue.dimension.forEach((dimension: string) => {
            this.getDimensionValues(metricValue.bbdd, metricValue.table_name, metricValue.metric, dimension);
          })
        }
      }
    }
  }

  generateResultMetric(indicatorIndex: number) {
    this.resultMetric = '';

    this.indicatorArray.at(indicatorIndex).controls.metrics.controls.forEach((metric, i) => {
      this.resultMetric += this.indicatorArray.at(indicatorIndex).get('name')?.value + '.' + (i+1);

      if (i < (this.indicatorArray.at(indicatorIndex).controls.metrics.controls.length - 1)) {
        this.resultMetric += this.indicatorArray.at(indicatorIndex).controls.metrics.controls[i + 1].get('operation')?.value!.symbol;
      }
    });
  }

  onChangeSelectOperation(indicatorIndex: number) {
    this.generateResultMetric(indicatorIndex);
  }

  getMetricTagsIntersection() {
    this.groupByForm.get('groupBy')?.setValue([]);

    let intersection: Set<string> | null = null;

    for (const indicator of this.indicatorArray.controls) 
    {
      const metricsArray = indicator.controls.metrics;

      for (const metricGroup of metricsArray.controls) {
        const metricValue = metricGroup.get('metric')?.value;

        if (metricValue && Array.isArray(metricValue.dimension)) {
          const currentSet = new Set(metricValue.dimension);

          if (intersection === null) 
          {
            intersection = currentSet;
          } 
          else 
          {
            intersection = new Set([...intersection].filter((dim: string) => currentSet.has(dim)));
          }
        }
      }
    }

    if (intersection && intersection != null && intersection != undefined)
      this.tagIntersectionOptions = Array.from(intersection).map(tag => ({ label: tag, value: tag }));
  }

  onChangeHasFinalOperation(indicatorIndex: number)
  {
    this.generateResultMetric(indicatorIndex);

    if (this.indicatorArray.at(indicatorIndex).get('hasFinalOperation')?.value)
    {
      this.resultMetric = '(' + this.resultMetric + ')' + this.indicatorArray.at(indicatorIndex).get('constantOp')?.value!.symbol + ' ' + this.indicatorArray.at(indicatorIndex).get('constantValue')?.value;
    }
  }

  watchGroupValidity(group: ThresholdFormGroup) {
    const fields = ['value', 'min', 'minIncluded', 'max', 'maxIncluded'];

    fields.forEach(fieldName => {
      const control = group.get(fieldName);
      if (control) {
        const sub = control.valueChanges.subscribe(() => {
          group.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });
        this.subscriptions.push(sub);
      }
    });
  }

  createThreshold() {
    const group: ThresholdFormGroup = this._fb.group({
      id: this._fb.control((this.thresholdArray.length + 1).toString()),
      type: this._fb.control(this.getNextAvailableSeverity()),
      comparation: this._fb.control(thresholdComparationOptions[0]),
      order: this._fb.control(this.thresholdArray.length + 1),
      value: this._fb.control(null),
      minIncluded: this._fb.control(true),
      min: this._fb.control(null),
      maxIncluded: this._fb.control(true),
      max: this._fb.control(null),
      status: this._fb.control(true),
      startBrackets: this._fb.control(null),
      endBrackets: this._fb.control(null),
      externalOperation: this._fb.control(null)
    }) as ThresholdFormGroup;

    this.thresholdArray.push(group);

    this.selectedDimensionValuesMap.set(group.get('id')?.value!, new Map());

    this.groupByForm.get('groupBy')?.value.forEach( (groupBy: any) => {
      let dimensionValuesMap: Map<string, string[]> = this.selectedDimensionValuesMap.get(group.get('id')?.value!)!;
      dimensionValuesMap.set(groupBy, this.dimensionValuesMap.get(groupBy)!);
      this.selectedDimensionValuesMap.set(group.get('id')?.value!, dimensionValuesMap);
    })

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
    },
    {
      validators: this.timeValidator
    }) as SilencePeriodFormGroup;

    group.get('from')?.valueChanges.subscribe(() => group.updateValueAndValidity());
    group.get('to')?.valueChanges.subscribe(() => group.updateValueAndValidity());

    this.silencePeriodArray.push(group);
  }

  timeValidator(group: AbstractControl): { [key: string]: any } | null {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;

    if (from && to && to <= from) {
      return { horaInvalida: true };
    }

    return null;
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

  createPermission() {
    this.permissionList.push(new Permission());
  }

  deletePermission(i: number) 
  {
    if (this.permissionList[i].team)
      this.teamList[this.teamList.findIndex(team => team.id == this.permissionList[i].team.id)].disabled = false;
    this.permissionList.splice(i, 1);
  }

  firstPermissionCompleted(): boolean {
    let team = this.permissionList[0].team;
    return team !== null && team !== undefined;
  }

  allPermissionsCompleted(): boolean {
    return this.permissionList.every(permission => {
      let team = permission.team;
      let type = permission.type;
      return team !== null && team !== undefined && type !== null && type !== undefined;
    });
  }

  onClickNavigateToCreateAlert() {
    this.router.navigate(['crear-alerta']);
  }

  onClickSetThresholdType(threshold: any, type: any) {
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
    this.notificationMessageForm.get('message')?.setValue(this.notificationMessageForm.get('message')?.value + this.groupByForm.get('groupBy')?.value[i] + '}}');
  }

  onClickAddConditionalBlockToDetails(i: number) {
    this.notificationMessageForm.get('details')?.setValue(this.notificationMessageForm.get('details')?.value + conditionalBlockOptions[i].label + '}\n\n{{/' + conditionalBlockOptions[i].value + '}}');
  }

  onClickAddTemplateVariableToDetails(i: number) {
    this.notificationMessageForm.get('details')?.setValue(this.notificationMessageForm.get('details')?.value + templateVariableOptions[i].value + '}}');
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

  onFilterMetricsChange(event: MultiSelectFilterEvent, metric: MetricFormGroup) {
    let term = event.filter?.trim() || '';

    if (term.length > 2)
      this.filterSubject.next({term, metric});
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

    for (let permission of this.permissionList)
    {
      alertPermissions.push(new AlertPermissionDto(permission.type.value.includes('rw') ? true : false, permission.team.id));
    }

    //CONDITION HISTORIES
    let alertConditionHistories: AlertConditionHistoryDto[] = [];

    //ENDPOINTS
    let endpointAlerts: EndpointAlertDto[] = [];

    for (let endpoint of this.endpointList) 
    {
      let endpointAlert: EndpointAlertDto = new EndpointAlertDto(endpoint.severities.map(severity => severity.value), endpoint.endpoint.id);
      endpointAlerts.push(endpointAlert);
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

    for (let indicator of this.indicatorArray.controls)
    {
      for (let metric of indicator.controls.metrics.controls) {
        alertMetrics.push(new AlertMetricDto(metric.get('metric')?.value!.bbdd!, metric.get('metric')?.value!.table_name!, metric.get('metric')?.value!.metric!, metric.get('operation')?.value!.value!, metric.get('order')?.value!));
      }

      alertIndicators.push(new AlertIndicatorDto(indicator.get('name')?.value!, alertMetrics, indicator.get('constantOp')?.value!.value!, indicator.get('constantValue')?.value!));
    }

    //UMBRALES
    let alertConditions: AlertConditionDto[] = [];

    for (let threshold of this.thresholdArray.controls) {
      let alertClauses: AlertClauseDto[] = [];

      alertClauses.push(new AlertClauseDto(threshold.get('startBrackets')?.value!, threshold.get('comparation')?.value.value, threshold.get('comparation')?.value.value == 0 || threshold.get('comparation')?.value.value == 1 ? threshold.get('value')?.value! : threshold.get('min')?.value!, threshold.get('endBrackets')?.value!, threshold.get('order')?.value!, threshold.get('externalOperation')?.value!, threshold.get('minIncluded')?.value!, threshold.get('max')?.value!, threshold.get('maxIncluded')?.value!));

      let conditionFilters: ConditionFilterDto[] = [];
      let dimensionValuesMap: Map<string, string[]> = this.selectedDimensionValuesMap.get(threshold.get('id')?.value!)!;

      for (let key of dimensionValuesMap.keys())
      {
        if (dimensionValuesMap.get(key)?.length! < this.dimensionValuesMap.get(key)?.length!)
        {
          for (let value of dimensionValuesMap.get(key)!)
          {
            conditionFilters.push(new ConditionFilterDto(key, value));
          }
        }
      }

      alertConditions.push(new AlertConditionDto(threshold.get('type')?.value.value, threshold.get('status')?.value!, alertClauses, conditionFilters));
    }

    //ALERTA
    let alertDto: AlertDto = new AlertDto(
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
  }

  onClickThresholdArrowDown(index: number) {
    [this.thresholdArray.controls[index], this.thresholdArray.controls[index + 1]] = [this.thresholdArray.controls[index + 1], this.thresholdArray.controls[index]];

    let orderAux: number = this.thresholdArray.controls[index].get('order')?.value!;
    this.thresholdArray.controls[index].get('order')?.setValue(this.thresholdArray.controls[index + 1].get('order')?.value!);
    this.thresholdArray.controls[index + 1].get('order')?.setValue(orderAux);

    this.thresholdArray.controls.forEach((threshold, i) => {
      threshold.get('id')?.setValue((i + 1).toString());
    });

    // this.generateResultMetric();
  }

  onClickThresholdArrowUp(index: number) {
    [this.thresholdArray.controls[index], this.thresholdArray.controls[index - 1]] = [this.thresholdArray.controls[index - 1], this.thresholdArray.controls[index]];

    let orderAux: number = this.thresholdArray.controls[index].get('order')?.value!;
    this.thresholdArray.controls[index].get('order')?.setValue(this.thresholdArray.controls[index - 1].get('order')?.value!);
    this.thresholdArray.controls[index - 1].get('order')?.setValue(orderAux);

    this.thresholdArray.controls.forEach((threshold, i) => {
      threshold.get('id')?.setValue((i + 1).toString());
    });

    // this.generateResultMetric();
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

    // console.log('this.selectedDimensionValuesMap.get(threshold.get("id")?.value)?.get(dimension)?.length: ' + this.selectedDimensionValuesMap.get(threshold.get('id')?.value)?.get(dimension)?.length);
    // console.log('this.dimensionValuesMap.get(dimension)?.length: ' + this.dimensionValuesMap.get(dimension)?.length);
  }

  onClickGoToCreateAlert()
  {
    this.router.navigate(['crear-alerta'], {
      state: { isThreshold: true }
    });
  }

  onClickGoToMofifyAlert()
  {
    this.router.navigate(['modificar-alerta']);
  }

  getActivationTime1()
  {
    let timeWindow: number = this.advancedOptionsForm.get('timeWindow')?.value.value;

    return this.formatTime(timeWindow * this.activationRecoverForm.get('activation1')?.value.value);
  }

  getActivationTime2()
  {
    let timeWindow: number = this.advancedOptionsForm.get('timeWindow')?.value.value;

    return this.formatTime(timeWindow * this.activationRecoverForm.get('activation2')?.value.value);
  }

  getRecoverTime1()
  {
    let timeWindow: number = this.advancedOptionsForm.get('timeWindow')?.value.value;

    return this.formatTime(timeWindow * this.activationRecoverForm.get('recover1')?.value.value);
  }

  getRecoverTime2()
  {
    let timeWindow: number = this.advancedOptionsForm.get('timeWindow')?.value.value;

    return this.formatTime(timeWindow * this.activationRecoverForm.get('recover2')?.value.value);
  }

  formatTime(totalSeconds: number): string 
  {
    let days = Math.floor(totalSeconds / 86400);
    let hours = Math.floor((totalSeconds % 86400) / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    const parts: string[] = [];

    if (days) parts.push(`${days} día${days > 1 ? 's' : ''}`);
    if (hours) parts.push(`${hours} h`);
    if (minutes) parts.push(`${minutes} m`);
    if (seconds) parts.push(`${seconds} s`);

    if (parts.length === 0) return '0 s';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} y ${parts[1]}`;

    return parts.slice(0, -1).join(', ') + ' y ' + parts.slice(-1);
  }

  disasterSelected()
  {
    let selected: boolean = false;

    this.thresholdArray.controls.forEach((group) => {
      if (group.get('type')?.value.value == 0)
        selected = true;
    });

    return selected;
  }

  criticalSelected()
  {
    let selected: boolean = false;  

    this.thresholdArray.controls.forEach((group) => {
      if (group.get('type')?.value.value == 1)
        selected = true;
    });

    return selected;
  }

  majorSelected()
  {
    let selected: boolean = false;

    this.thresholdArray.controls.forEach((group) => {
      if (group.get('type')?.value.value == 2)
        selected = true;
    });

    return selected;
  }

  warningSelected()
  {
    let selected: boolean = false;

    this.thresholdArray.controls.forEach((group) => {
      if (group.get('type')?.value.value == 3)
        selected = true;
    });

    return selected;
  }

  onChangeGroupBy(event: MultiSelectChangeEvent)
  {
    this.thresholdArray.controls.forEach((group) => {
      let dimensionValuesMap: Map<string, string[]> = this.selectedDimensionValuesMap.get(group.get('id')?.value!)!;
      dimensionValuesMap.set(event.itemValue.value, this.dimensionValuesMap.get(event.itemValue.value)!);
      this.selectedDimensionValuesMap.set(group.get('id')?.value!, dimensionValuesMap);
    })
  }

  getEndpointsByType()
  {
    this.endpointService.getEndpointsByType().subscribe(
      (response: any) => {
        this.endpointsByTypeMap = response;
      },
      (error: any) => {

      }
    );
  }

  onChangeStep3EndpointType()
  {
    this.endpointFieldValues = this.endpointsByTypeMap[this.endpointForm.get('type')?.value.value] || [];
    this.endpointForm.get('endpoint')?.enable();
    this.endpointForm.get('severities')?.enable();
  }

  onClickAddEndpoint()
  {
    this.endpointList.push(new Endpoint(this.endpointForm.get('type')?.value, this.endpointForm.get('endpoint')?.value, this.endpointForm.get('severities')?.value));

    this.endpointForm.reset();
    this.endpointForm.get('endpoint')?.disable();
    this.endpointForm.get('severities')?.disable();
  }

  onClickDeleteEndpoint (i: number) 
  {
    this.endpointList.splice(i, 1);
  }

  getAllTeams()
  {
    this.permissionList = [];

    this.alertService.getAllTeams().subscribe(
      (response) => 
      {
        this.teamList = response;

        this.permissionList.push(new Permission(this.teamList.filter(team => team.id == this.authService.getTeam())[0], permissionTypeOptions[1]));
        this.teamList[this.teamList.findIndex(team => team.id == this.authService.getTeam())].disabled = true;
      },
      (error) => 
      {
      }
    );
  }

  onChangeTeam(event: any)
  {
    this.teamList[this.teamList.findIndex(team => team.id == event.value.id)].disabled = true;
  }

  isSeveritySelected(type: any)
  {
    let isSelected = false;

    this.thresholdArray.controls.forEach(threshold => {
      if (threshold.get('type')?.value.value == type.value)
        isSelected = true;
    });

    return isSelected;
  }

  getNextAvailableSeverity()
  {
    if (this.isSeveritySelected(this.thresholdTypeOptions[0]))
    {
      if (this.isSeveritySelected(this.thresholdTypeOptions[1]))
      {
        if (this.isSeveritySelected(this.thresholdTypeOptions[2]))
        {
          return this.thresholdTypeOptions[3];
        }
        else
        {
          return this.thresholdTypeOptions[2];
        }
      }
      else
      {
        return this.thresholdTypeOptions[1];
      }
    }
    else
    {
      return this.thresholdTypeOptions[0];
    }
  }
}
