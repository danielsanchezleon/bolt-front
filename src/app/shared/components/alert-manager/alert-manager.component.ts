import { Component, HostListener, OnInit } from '@angular/core';
import { PageWrapperComponent } from '../../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from '../../../shared/components/accordion/accordion.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, Validators, FormArray, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { MultiSelectChangeEvent, MultiSelectFilterEvent, MultiSelectModule } from 'primeng/multiselect';
import { FluidModule } from 'primeng/fluid';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { SanitizeExpressionPipe } from '../../../shared/pipes/replace-empty.pipe';
import { FloatLabelModule } from 'primeng/floatlabel';

import { errorBehaviorOptions } from '../../../shared/constants/threshold-options';
import { InputNumberModule } from 'primeng/inputnumber';
import { InnerAccordionComponent } from '../../../shared/components/inner-accordion/inner-accordion.component';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { endpointTypeOptions, conditionalBlockOptions, templateVariableOptions } from '../../../shared/constants/addressee-options';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { FloatingGraphComponent } from '../../../shared/components/floating-graph/floating-graph.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { concatMap, debounceTime, finalize, from, map, Subject, Subscription, switchMap, tap } from 'rxjs';
import { permissionTypeOptions } from '../../../shared/constants/permission-options';
import { DialogModule } from 'primeng/dialog';
import { MetricService } from '../../../shared/services/metric.service';
import { TableMetricInfo } from '../../../shared/models/TableMetricInfo';
import { SkeletonModule } from 'primeng/skeleton';
import { AlertClauseDto } from '../../../shared/dto/AlertClauseDto';
import { AlertConditionDto } from '../../../shared/dto/AlertConditionDto';
import { AlertConditionHistoryDto } from '../../../shared/dto/AlertConditionHistoryDto';
import { AlertDto } from '../../../shared/dto/AlertDto';
import { AlertIndicatorDto } from '../../../shared/dto/AlertIndicatorDto';
import { AlertMetricDto } from '../../../shared/dto/AlertMetricDto';
import { AlertPermissionDto } from '../../../shared/dto/AlertPermissionDto';
import { AlertSilenceDto } from '../../../shared/dto/AlertSilenceDto';
import { ConditionFilterDto } from '../../../shared/dto/ConditionFilterDto';
import { EndpointAlertDto } from '../../../shared/dto/EndpointAlertDto';
import { FilterLogDto } from '../../../shared/dto/FilterLogDto';
import { AlertService } from '../../../shared/services/alert.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { EndpointService } from '../../../shared/services/endpoint.service';
import { EndpointViewDto } from '../../../shared/dto/endpoint/EndpointViewDto';
import { TeamViewDto } from '../../../shared/dto/TeamViewDto';
import { AuthService } from '../../../shared/services/auth.service';
import { AlertViewDto } from '../../dto/alert/AlertViewDto';

import {matOperationOptions, 
        timeWindowOptions, 
        discardTimeOptions, 
        periodicityOptions, 
        severityOptions, 
        clauseComparationOptions, 
        activationRecoverEvaluationOptions, 
        silencePeriodDayOptions 
      } from '../../constants/alert-constants';

type TokType = 'VAR' | 'NUM' | 'OP' | 'LPAREN' | 'RPAREN';
interface Tok { type: TokType; value: string }

/** Alternativas de índices 1..n ordenadas por longitud descendente (evita que "10" coincida como "1") */
function makeIdxAlternatives(n: number): string {
  return Array.from({ length: n }, (_, i) => String(n - i)).join('|'); // n,n-1,...,1
}

/** Regex de tokens válidos: variables [A-Z].(1..n), números (enteros/decimales), + - * / %, paréntesis y espacios */
export function makeTokenRegex(n: number): RegExp {
  if (n < 1) throw new Error('n debe ser >= 1');
  const idx = makeIdxAlternatives(n);
  const num = String.raw`(?:\d+(?:\.\d+)?|\.\d+)`; // 100 | 3.5 | .5

  // Anclada y sólo con tokens permitidos (espacios opcionales entre tokens)
  const pattern = String.raw`^(?:\s*(?:\(|\)|[+\-*/%]|[A-Z]\.(?:${idx})|${num})\s*)+$`;
  return new RegExp(pattern);
}

/** Tokenizador (usa 'y' sticky para consumir secuencialmente) */
function tokenize(expr: string): Tok[] {
  const re = /\s*(?:([A-Z]\.\d+)|(\d+(?:\.\d+)?|\.\d+)|([+\-*/%])|([()]))\s*/gy;
  const tokens: Tok[] = [];
  let i = 0;

  while (i < expr.length) {
    re.lastIndex = i;
    const m = re.exec(expr);
    if (!m) break;
    if (m[1]) tokens.push({ type: 'VAR', value: m[1] });
    else if (m[2]) tokens.push({ type: 'NUM', value: m[2] });
    else if (m[3]) tokens.push({ type: 'OP', value: m[3] });
    else if (m[4] === '(') tokens.push({ type: 'LPAREN', value: '(' });
    else if (m[4] === ')') tokens.push({ type: 'RPAREN', value: ')' });
    i = re.lastIndex;
  }
  return tokens;
}

/** Gramática: paréntesis balanceados, sin terminar en operador, sin dobles operadores, admite + / - unarios */
function isGrammarValid(expr: string): boolean {
  const toks = tokenize(expr);

  // Verifica que se haya tokenizado todo (si hay "basura", falla)
  const joined = toks.map(t => t.value).join('');
  const stripped = expr.replace(/\s+/g, '');
  if (joined.length !== stripped.length) return false;

  let expectOperand = true; // al inicio esperamos operando
  const stack: string[] = [];

  for (const t of toks) {
    if (expectOperand) {
      if (t.type === 'VAR' || t.type === 'NUM') {
        expectOperand = false;
      } else if (t.type === 'LPAREN') {
        stack.push('('); // seguimos esperando operando
      } else if (t.type === 'OP' && (t.value === '+' || t.value === '-')) {
        // unario permitido; seguimos esperando operando
      } else {
        return false; // operador binario o ')' donde debía ir un operando
      }
    } else {
      if (t.type === 'OP') {
        expectOperand = true; // tras operador, esperamos operando
      } else if (t.type === 'RPAREN') {
        if (stack.length === 0) return false;
        stack.pop();
        // seguimos sin esperar operando (puede venir operador o ')')
      } else {
        return false; // dos operandos seguidos o '(' después de operando
      }
    }
  }

  // Debe terminar en operando o ')', y no quedar paréntesis sin cerrar
  return !expectOperand && stack.length === 0;
}

/** Validador completo: tokens válidos, misma letra, índices 1..n, gramática correcta */
export function algebraExprValidator(n: number): ValidatorFn {
  const tokenRe = makeTokenRegex(n);
  const varRe = /\b([A-Z])\.(\d+)\b/g;

  return (control: AbstractControl) => {
    const raw = (control.value ?? '') as string;
    const value = raw.trim();
    if (!value) return null; // deja 'required' a otro validador

    // 1) Sólo tokens permitidos
    if (!tokenRe.test(value)) return { algebraTokens: true };

    // 2) Variables: misma letra e índices en rango
    const matches = [...value.matchAll(varRe)];
    if (matches.length === 0) return { noVariables: true };

    const letters = new Set(matches.map(m => m[1]));
    if (letters.size !== 1) return { mixedLetters: true };

    const idxOk = matches.every(m => {
      const k = Number(m[2]);
      return Number.isInteger(k) && k >= 1 && k <= n;
    });
    if (!idxOk) return { indexOutOfRange: true };

    // 3) Gramática (incluye paréntesis balanceados, sin terminar en operador, etc.)
    if (!isGrammarValid(value)) return { invalidOrder: true };

    return null;
  };
}

export class Endpoint {
  id: number | null;
  type: any;
  endpoint: any;
  severities: any[];

  constructor(id: number | null, type: any, endpoint: any, severities: any[]) {
    this.id = id;
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
  id: any;
  team: any;
  type: any;

  constructor(id?: number | null, team?: TeamViewDto, type?: any) {
    this.id = id;
    this.team = team;
    this.type = type;
  }
}

type MetricFormGroup = FormGroup<{
  metricId: FormControl<number | null>;
  id: FormControl<string>;
  metric: FormControl<TableMetricInfo | null>;
  operation: FormControl<any>;
  options: FormControl<TableMetricInfo[]>;
}>;

type IndicatorFormGroup = FormGroup<{
  id: FormControl<number | null>;
  name: FormControl<string>;
  metrics: FormArray<MetricFormGroup>;
  finalExpression: FormControl<string>;
}>;

type IndicatorFormArray = FormArray<IndicatorFormGroup>;

type ClauseFormGroup = FormGroup<{
  clauseId: FormControl<number | null>;
  indicatorName: FormControl<string>;
  id: FormControl<string>;
  comparation: FormControl<any>;
  order: FormControl<number>;
  value: FormControl<number | null>;
  minIncluded: FormControl<boolean>;
  min: FormControl<number | null>;
  maxIncluded: FormControl<boolean>;
  max: FormControl<number | null>;
  startBrackets: FormControl<number | null>;
  endBrackets: FormControl<number | null>;
  externalOperation: FormControl<string | null>;
}>;

type ConditionFormGroup = FormGroup<{
  conditionId: FormControl<number | null>;
  id: FormControl<string>;
  severity: FormControl<any>;
  status: FormControl<boolean>;
  clauses: FormArray<ClauseFormGroup>;
}>;

type ConditionFormArray = FormArray<ConditionFormGroup>;

type SilencePeriodFormGroup = FormGroup<{
  id: FormControl<string>;
  days: FormControl<any[] | null>;
  from: FormControl<Date | null>;
  to: FormControl<Date | null>;
  stored: FormControl<boolean>;
}>;

type SilencePeriodFormArray = FormArray<SilencePeriodFormGroup>;

@Component({
  selector: 'app-alert-manager',
  imports: [ToggleSwitchModule, SkeletonModule, DialogModule, PageWrapperComponent, ReactiveFormsModule, ModalComponent, TabsModule, TextareaModule, ButtonModule, CommonModule, AccordionComponent, MultiSelectModule, FormsModule, FluidModule, SelectModule, TooltipModule, InputTextModule, SanitizeExpressionPipe, FloatLabelModule, InputNumberModule, InnerAccordionComponent, CheckboxModule, DatePickerModule, RadioButtonModule],
  templateUrl: './alert-manager.component.html',
  styleUrl: './alert-manager.component.scss'
})
export class AlertManagerComponent implements OnInit{
  //General
  alertId: number = 0;
  mode: string = 'create';
  alertType: string = 'simple';
  subscriptions: Subscription[] = [];

  isInitialMetricListLoading: boolean = false;

  //Step 1
  matOperationOptions: any[] = [];

  internalName: string = '';
  name: string = '';
  configuredAlertExists: number | null = null;

  indicatorArray: IndicatorFormArray;
  indicatorNames: string[] = [];
  private filterSubject = new Subject<{ term: string, metric: MetricFormGroup & { options?: TableMetricInfo[] } }>();
  loadingMetricList: boolean = false;

  metricList: TableMetricInfo[] = [];
  letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  resultMetricMap: Map<number, string> = new Map();
  resultMetricEditionMap: Map<number, boolean> = new Map();

  tagIntersectionOptions: any[] = [];
  groupByOperationOptions: any[] = []

  dimensionValuesMap: Map<string, string[]> = new Map();
  selectedDimensionValuesMap: Map<string, Map<string, string[]>> = new Map();

  timeWindowOptions: any[] = [];
  discardTimeOptions: any[] = [];
  periodicityOptions: any[] = [];

  groupByForm: FormGroup;
  advancedOptionsForm: FormGroup;

  //Step 2
  severityOptions: any[] = [];
  clauseComparationOptions: any[] = [];
  conditionArray: ConditionFormArray;
  lastThresholdArrayLength: number = 0;

  conditionTextMap: Map<number, string> = new Map();

  externalOperationOptions: string[] = ['AND', 'OR'];

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
  dolphinError: boolean = false;

  constructor(
    private router: Router,
    private _fb: FormBuilder,
    private metricService: MetricService,
    private alertService: AlertService,
    private endpointService: EndpointService,
    private authService: AuthService,
    private route: ActivatedRoute ) {

    this.route.snapshot.paramMap.has('alert_id') ? this.mode = 'edit' : this.mode = 'create';

    if (this.route.snapshot.paramMap.has('alert_type'))
    {
      this.alertType = this.route.snapshot.params['alert_type'];
    }

    if (this.mode == 'edit')
    {
      this.alertId = this.route.snapshot.params['alert_id'];
    }

    //Step 1
    this.indicatorArray = this._fb.array<IndicatorFormGroup>([]);

    this.groupByForm = this._fb.group({
      groupBy: [[], []]
    });

    this.advancedOptionsForm = this._fb.group({
      timeWindow: [timeWindowOptions[1], [Validators.required]],
      discardTime: [discardTimeOptions[0], [Validators.required]],
      periodicity: [periodicityOptions[1], [Validators.required]]
    });

    //Step 2
    this.conditionArray = this._fb.array<ConditionFormGroup>([]);

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

    if (this.route.snapshot.paramMap.has('alert_id'))
    {
      this.getAlert();
    }
    else
    {
      this.createIndicator();
      this.createCondition();
      this.createSilencePeriod();
    }

    //Step 1

    this.matOperationOptions = matOperationOptions;

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

    this.timeWindowOptions = timeWindowOptions;
    this.discardTimeOptions = discardTimeOptions;
    this.periodicityOptions = periodicityOptions;

    //Step 2
    this.severityOptions = severityOptions;
    this.clauseComparationOptions = clauseComparationOptions;

    this.activationRecoverEvaluationOptions = activationRecoverEvaluationOptions;

    this.silencePeriodDayOptions = silencePeriodDayOptions;

    this.errorBehaviorOptions = errorBehaviorOptions;

    //Step 3
    this.getEndpointsByType();

    this.endpointTypeOptions = endpointTypeOptions;

    this.conditionalBlockOptions = conditionalBlockOptions;
    this.templateVariableOptions = templateVariableOptions;

    //Step 4
    this.permissionTypeOptions = permissionTypeOptions;
    this.getAllTeams();
  }

  getAlert()
  {
    this.alertService.getAlert(this.alertId).subscribe(
      (response) => {
        this.fromDtoToForm(response);
      },
      (error) => {
      }
    )
  }

  onClickNavigateToCreateAlert() {
    this.router.navigate(['alert/create']);
  }

  onClickNavigateToAlerts() {
    this.router.navigate(['alerts']);
  }

  generateInternalNameAndName()
  {
    this.internalName = '';
    this.name = '';

    let metricNameList: string[] = [];

    this.indicatorArray.controls.forEach(indicator => {
      if (indicator.controls.metrics.controls.length > 0)
      {
        indicator.controls.metrics.controls.forEach(metric => {
          metricNameList.push(metric.get('metric')?.value?.metric!);
        });
      }
    });

    this.internalName = metricNameList.join('_');
    this.name = metricNameList.join(' ');

    if (this.groupByForm.get('groupBy')?.value.length > 0)
    {
      this.internalName += '_' + this.groupByForm.get('groupBy')?.value.join(',')
    }

    if (this.mode == 'create' && !this.authService.isAdmin())
      this.existsByInternalName();
  }

  existsByInternalName()
  {
    this.alertService.existsByInternalName(this.internalName).subscribe(
      (response: any) => {
        this.configuredAlertExists = response;
      }
    )
  }

  //INDICATORS
  createIndicator()
  {
    let indicatorIndex: number = this.indicatorArray.length;

    const group: IndicatorFormGroup = this._fb.group({
      id: this._fb.control(null),
      name: this._fb.control(this.letters[indicatorIndex]),
      metrics: this._fb.array<MetricFormGroup>([]),
      finalExpression: this._fb.control(''),
    }) as IndicatorFormGroup;

    this.indicatorArray.push(group);

    this.createMetric(indicatorIndex);

    this.resultMetricMap.set(indicatorIndex, '');
    this.resultMetricEditionMap.set(indicatorIndex, true);
    this.indicatorArray.at(indicatorIndex).get('finalExpression')?.setValue(this.resultMetricMap.get(indicatorIndex)!);

    this.indicatorNames.push(this.letters[indicatorIndex]);
  }

  removeIndicator(indicatorIndex: number)
  {
    this.indicatorArray.removeAt(indicatorIndex);
    this.indicatorNames = [];

    for (let indicator of this.indicatorArray.controls)
    {
      indicator.get('name')?.setValue(this.letters[this.indicatorArray.controls.indexOf(indicator)]);
      this.indicatorNames.push(this.letters[this.indicatorArray.controls.indexOf(indicator)]);
    }

    this.getMetricTagsIntersection();

    this.resultMetricMap.delete(indicatorIndex);

    this.conditionArray.controls.forEach(condition => {
      condition.controls.clauses.controls.forEach(clause => {
        clause.get('indicatorName')?.setValue(this.letters[0]);
      });
    });
  }

  createMetric(indicatorIndex: number)
  {
    this.indicatorArray.at(indicatorIndex).controls.metrics.push(this._fb.group({
      metricId: this._fb.control(null),
      id: this._fb.control((this.indicatorArray.at(indicatorIndex).controls.metrics.length! + 1).toString()),
      metric: this._fb.control(null),
      operation: this._fb.control(matOperationOptions[1]),
      options: this._fb.control([] as TableMetricInfo[])
    }) as MetricFormGroup);
  
    this.rebindExprValidator(indicatorIndex);
  }

  removeMetric(indicatorIndex: number, metricIndex: number)
  {
    this.indicatorArray.at(indicatorIndex).controls.metrics.removeAt(metricIndex);

    for (let metric of this.indicatorArray.at(indicatorIndex).controls.metrics.controls)
    {
      metric.get('id')?.setValue((this.indicatorArray.at(indicatorIndex).controls.metrics.controls.indexOf(metric) + 1).toString());
    }

    this.getMetricTagsIntersection();

    this.generateInternalNameAndName();

    this.rebindExprValidator(indicatorIndex);
  }

  onChangeMetricSelect(indicatorIndex: number)
  {
    this.generateInternalNameAndName();

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
            this.getDimensionValues(metricValue.bbdd!, metricValue.table_name!, metricValue.metric!, dimension);
          })
        }
      }
    }
  }

  getMetricTagsIntersection() {
    let intersection: Set<string> | null = null;

    this.indicatorArray.controls.forEach((indicator, i) => {
      indicator.get('metrics')?.value.forEach((metric, j) => {
        if (metric && Array.isArray(metric.metric!.dimension)) {
          const currentSet = new Set(metric.metric!.dimension);

          if (intersection === null) 
          {
            intersection = currentSet;
          } 
          else 
          {
            intersection = new Set([...intersection].filter((dim: string) => currentSet.has(dim)));
          }
        }
      });
    });

    if (intersection && intersection != null && intersection != undefined)
      this.tagIntersectionOptions = Array.from(intersection).map(tag => ({ label: tag, value: tag }));
  }

  watchGroupValidity(group: ConditionFormGroup) {
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

  createClause(conditionIndex: number)
  {
    this.conditionArray.at(conditionIndex).controls.clauses.push(this._fb.group({
      clauseId: this._fb.control(null),
      indicatorName: this._fb.control('A'),
      id: this._fb.control((this.conditionArray.at(conditionIndex).controls.clauses.length! + 1).toString()),
      comparation: this._fb.control(clauseComparationOptions[0]),
      order: this._fb.control(this.conditionArray.length + 1),
      value: this._fb.control(null),
      minIncluded: this._fb.control(true),
      min: this._fb.control(null),
      maxIncluded: this._fb.control(true),
      max: this._fb.control(null),
      startBrackets: this._fb.control(this.alertType == 'composite' ? 0 : null),
      endBrackets: this._fb.control(this.alertType == 'composite' ? 0 : null),
      externalOperation: this._fb.control(this.alertType == 'composite' ? 'AND' : null)
    }) as ClauseFormGroup);

    let group: ClauseFormGroup = this.conditionArray.at(conditionIndex).controls.clauses.at(this.conditionArray.at(conditionIndex).controls.clauses.length!-1);

    group.valueChanges.subscribe(() => {
      this.conditionTextMap.set(conditionIndex, this.generateConditionText(conditionIndex));
    });

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

    //Each dimensions values are added to the current clause
    this.selectedDimensionValuesMap.set(group.get('id')?.value!, new Map());

    this.groupByForm.get('groupBy')?.value.forEach( (groupBy: any) => {
      let dimensionValuesMap: Map<string, string[]> = this.selectedDimensionValuesMap.get(group.get('id')?.value!)!;
      dimensionValuesMap.set(groupBy, this.dimensionValuesMap.get(groupBy)!);
      this.selectedDimensionValuesMap.set(group.get('id')?.value!, dimensionValuesMap);
    })
  }

  generateConditionText(conditionIndex: number): string
  {
    let text: string = '';
    this.conditionArray.at(conditionIndex).controls.clauses.controls.forEach( (clause, clauseIndex) => {
      if (clauseIndex > 0)
        text += ' ' + (clause.get('externalOperation')?.value ?? '') + ' ';
      text += (clause.get('startBrackets')?.value ?? 0) > 0 ? '( '.repeat(clause.get('startBrackets')?.value!) : '';
      text += clause.get('indicatorName')?.value ?? '';
      switch (clause.get('comparation')?.value.value) {
        case 'MORE_THAN':
          text += ' > ';
          text += clause.get('value')?.value ?? '?';
          break;
        case 'LESS_THAN':
          text += ' < ';
          text += clause.get('value')?.value ?? '?';
          break;
        case 'WITHIN_RANGE':
          text += ' entre ';
          text += clause.get('minIncluded')?.value ? ' [ ' : ' ( ';
          text += clause.get('min')?.value ?? '?';
          text += ' , ';
          text += clause.get('max')?.value ?? '?';
          text += clause.get('maxIncluded')?.value ? ' ] ' : ' ) ';
          break;
        case 'OUT_OF_RANGE':
          text += ' fuera de ';
          text += clause.get('minIncluded')?.value ? ' [ ' : ' ( ';
          text += clause.get('min')?.value ?? '?';
          text += ' , ';
          text += clause.get('max')?.value ?? '?';
          text += clause.get('maxIncluded')?.value ? ' ] ' : ' ) ';
          break;
        default:
          break;
      }
      text += (clause.get('endBrackets')?.value ?? 0) > 0 ? ' )'.repeat(clause.get('endBrackets')?.value!) : '';
    });
    return text;
  }

  removeClause(conditionIndex: number, clauseIndex: number)
  {
    this.selectedDimensionValuesMap.delete(this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('id')?.value!);
    this.conditionArray.at(conditionIndex).controls.clauses.removeAt(clauseIndex);
    this.conditionArray.at(conditionIndex).controls.clauses.at(0).get('externalOperation')?.setValue(null);
  }

  createCondition() {

    let selectedSeverityIndex: number = this.getNextAvailableSeverity();

    const group: ConditionFormGroup = this._fb.group({
      conditionId: this._fb.control(null),
      id: this._fb.control((this.conditionArray.length + 1).toString()),
      severity: this._fb.control(severityOptions[selectedSeverityIndex]),
      status: this._fb.control(true),
      clauses:  this._fb.array<ClauseFormGroup>([])
    }) as ConditionFormGroup;

    this.conditionArray.push(group);

    this.createClause(this.conditionArray.length-1);

    this.watchGroupValidity(group);

    this.lastThresholdArrayLength = this.conditionArray.length;

    severityOptions[selectedSeverityIndex].disabled = false;
  }

  allValuesCompleted(): boolean {
    return this.conditionArray.controls.every(group => {
      return group.valid;
    });
  }

  createSilencePeriod() {
    const group: SilencePeriodFormGroup = this._fb.group({
      id: this._fb.control((this.silencePeriodArray.length + 1).toString()),
      days: this._fb.control(null),
      from: this._fb.control(null),
      to: this._fb.control(null),
      stored: this._fb.control(false)
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
    let newPermission: Permission = new Permission();
    newPermission.type = this.permissionTypeOptions[1];
    this.permissionList.push(newPermission);
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

  onClickSetConditionType(condition: any, type: any) {

    this.severityOptions[severityOptions.findIndex((svt) => svt.label == condition.get('severity').value.label)].disabled = true;

    condition.get('severity').setValue(type);

    this.severityOptions[severityOptions.findIndex((svt) => svt.label == type.label)].disabled = false;
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

  onFilterMetricsChange(event: MultiSelectFilterEvent, metric: MetricFormGroup) {
    let term = event.filter?.trim() || '';

    if (term.length > 2)
      this.filterSubject.next({term, metric});
  }

  onClickRemoveSelectedThreshold(index: number) {

    this.severityOptions[this.severityOptions.findIndex((svt) => svt.label == this.conditionArray.controls.at(index)!.get('severity')?.value.label)].disabled = true;

    this.selectedDimensionValuesMap.delete(this.conditionArray.controls.at(index)?.get('id')?.value!);

    this.conditionArray.controls.splice(index, 1);

    this.conditionArray.controls.forEach((condition, i) => {
      condition.get('id')?.setValue((i + 1).toString());
    });
  }

  onClickThresholdArrowDown(index: number) {
    [this.conditionArray.controls[index], this.conditionArray.controls[index + 1]] = [this.conditionArray.controls[index + 1], this.conditionArray.controls[index]];

    let orderAux: number | null = this.conditionArray.controls[index].get('order')?.value!;
    this.conditionArray.controls[index].get('order')?.setValue(this.conditionArray.controls[index + 1].get('order')?.value!);
    this.conditionArray.controls[index + 1].get('order')?.setValue(orderAux);

    this.conditionArray.controls.forEach((condition, i) => {
      condition.get('id')?.setValue((i + 1).toString());
    });

    // this.generateResultMetric();
  }

  onClickThresholdArrowUp(index: number) {
    [this.conditionArray.controls[index], this.conditionArray.controls[index - 1]] = [this.conditionArray.controls[index - 1], this.conditionArray.controls[index]];

    let orderAux: number | null = this.conditionArray.controls[index].get('order')?.value!;
    this.conditionArray.controls[index].get('order')?.setValue(this.conditionArray.controls[index - 1].get('order')?.value!);
    this.conditionArray.controls[index - 1].get('order')?.setValue(orderAux);

    this.conditionArray.controls.forEach((condition, i) => {
      condition.get('id')?.setValue((i + 1).toString());
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
  }

  onClickGoToCreateAlert()
  {
    this.router.navigate(['alert/create'], {
      state: { isThreshold: true }
    });
  }

  onClickGoToMofifyAlert()
  {
    this.router.navigate(['alerts']);
  }

  toSeconds(timeStr: string): number 
  {
    const match = timeStr.match(/^(\d+)([smhd])$/i);
    if (!match) {
      throw new Error("Formato inválido: " + timeStr);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case "s": return value;          // segundos
      case "m": return value * 60;     // minutos
      case "h": return value * 3600;   // horas
      case "d": return value * 86400;  // días
      default: throw new Error("Unidad no soportada: " + unit);
    }
  }

  getActivationTime1()
  {
    let timeWindow: string = this.advancedOptionsForm.get('timeWindow')?.value.value;

    return this.formatTime(this.toSeconds(timeWindow) * this.activationRecoverForm.get('activation1')?.value.value);
  }

  getActivationTime2()
  {
    let timeWindow: string = this.advancedOptionsForm.get('timeWindow')?.value.value;

    return this.formatTime(this.toSeconds(timeWindow) * this.activationRecoverForm.get('activation2')?.value.value);
  }

  getRecoverTime1()
  {
    let timeWindow: string = this.advancedOptionsForm.get('timeWindow')?.value.value;

    return this.formatTime(this.toSeconds(timeWindow) * this.activationRecoverForm.get('recover1')?.value.value);
  }

  getRecoverTime2()
  {
    let timeWindow: string = this.advancedOptionsForm.get('timeWindow')?.value.value;

    return this.formatTime(this.toSeconds(timeWindow) * this.activationRecoverForm.get('recover2')?.value.value);
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

    this.conditionArray.controls.forEach((group) => {
      if (group.get('severity')?.value.value == 0)
        selected = true;
    });

    return selected;
  }

  criticalSelected()
  {
    let selected: boolean = false;  

    this.conditionArray.controls.forEach((group) => {
      if (group.get('severity')?.value.value == 1)
        selected = true;
    });

    return selected;
  }

  majorSelected()
  {
    let selected: boolean = false;

    this.conditionArray.controls.forEach((group) => {
      if (group.get('severity')?.value.value == 2)
        selected = true;
    });

    return selected;
  }

  warningSelected()
  {
    let selected: boolean = false;

    this.conditionArray.controls.forEach((group) => {
      if (group.get('severity')?.value.value == 3)
        selected = true;
    });

    return selected;
  }

  onChangeGroupBy(event: MultiSelectChangeEvent)
  {
    this.generateInternalNameAndName();

    this.conditionArray.controls.forEach((group) => {
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
    this.endpointList.push(new Endpoint(null, this.endpointForm.get('type')?.value, this.endpointForm.get('endpoint')?.value, this.endpointForm.get('severities')?.value));

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

        if (this.mode == 'create')
        {
          this.permissionList.push(new Permission(null, this.teamList.filter(team => team.id == this.authService.getTeam())[0], permissionTypeOptions[1]));
          this.teamList[this.teamList.findIndex(team => team.id == this.authService.getTeam())].disabled = true;
        }
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

    this.conditionArray.controls.forEach(condition => {
      if (condition.get('severity')?.value.value == type.value)
        isSelected = true;
    });

    return isSelected;
  }

  getNextAvailableSeverity(): number
  {
    if (this.isSeveritySelected(this.severityOptions[0]))
    {
      if (this.isSeveritySelected(this.severityOptions[1]))
      {
        if (this.isSeveritySelected(this.severityOptions[2]))
        {
          return 3;
        }
        else
        {
          return 2;
        }
      }
      else
      {
        return 1;
      }
    }
    else
    {
      return 0;
    }
  }

  async fromDtoToForm(alertViewDto: AlertViewDto)
  {
    //INDICATORS
    alertViewDto.indicators?.forEach((indicator, i) => 
    {
      const newIndicator: IndicatorFormGroup = this._fb.group({
        id: this._fb.control(indicator.id),
        name: this._fb.control(indicator.name),
        metrics: this._fb.array<MetricFormGroup>([]),
        finalExpression: this._fb.control(indicator.finalExpression)
      }) as IndicatorFormGroup;

      this.resultMetricMap.set(i, indicator.finalExpression!);

      this.indicatorArray.push(newIndicator);

      const metrics = alertViewDto.indicators?.at(i)?.alertMetrics ?? [];

      this.isInitialMetricListLoading = true;

      this.indicatorNames.push(this.letters[i]);

      //METRICS
      from(metrics).pipe(
        // concatMap garantiza que cada inner observable se suscriba solo cuando
        // el anterior se haya completado (secuencial).
        concatMap((metric, j) =>
          this.metricService.getMetrics(metric.metricName!).pipe(
            tap((response) => {
              this.indicatorArray.at(i).controls.metrics.push(this._fb.group({
                metricId: this._fb.control(metric.metricId),
                id: this._fb.control((j + 1).toString()),
                metric: this._fb.control(response[0]),
                operation: this._fb.control(matOperationOptions.find((opt) => opt.value == metric.operation)),
                options: this._fb.control(response)
              }) as MetricFormGroup);
            })
          )
        ),
        finalize(() => {
          this.isInitialMetricListLoading = false;
        })
      ).subscribe(
        {
          complete: () => 
          {
            this.onChangeMetricSelect(i);
            this.groupByForm.get('groupBy')?.setValue(alertViewDto.groupBy);
            this.generateInternalNameAndName();
          }
      });
    });

    //ADVANCED OPTIONS
    this.advancedOptionsForm.get('timeWindow')?.setValue(timeWindowOptions.find((two) => two.label.startsWith(alertViewDto.evaluationPeriod!.replace(/(\d+)([a-zA-Z]+)/, "$1 $2"))));
    this.advancedOptionsForm.get('discardTime')?.setValue(discardTimeOptions.find((dto) => dto.value == alertViewDto.offset));
    this.advancedOptionsForm.get('periodicity')?.setValue(periodicityOptions.find((po) => po.label.startsWith(alertViewDto.evaluationFrequency!.replace(/(\d+)([a-zA-Z]+)/, "$1 $2"))));

    //CONDITIONS
    alertViewDto.conditions?.forEach((condition, i) => {

      const newCondition: ConditionFormGroup = this._fb.group({
        conditionId: this._fb.control(condition.id),
        id: this._fb.control((this.conditionArray.length + 1).toString()),
        severity: this._fb.control(this.severityOptions.find((opt) => opt.value == condition.severity)),
        status: this._fb.control(condition.status),
        clauses:  this._fb.array<ClauseFormGroup>([])
      }) as ConditionFormGroup;

      this.conditionArray.push(newCondition);

      //CLAUSES
      condition.alertClauses?.forEach((clause) => {

        let id: string = (this.conditionArray.at(i).controls.clauses.length! + 1).toString();

        this.conditionArray.at(i).controls.clauses.push(this._fb.group({
          clauseId: this._fb.control(clause.id),
          indicatorName: this._fb.control(clause.indicatorName),
          id: this._fb.control((this.conditionArray.at(i).controls.clauses.length! + 1).toString()),
          comparation: this._fb.control(this.clauseComparationOptions.find((opt) => opt.value == clause.compOperation)),
          order: this._fb.control(this.conditionArray.length + 1),
          value: this._fb.control(clause.threshold),
          minIncluded: this._fb.control(clause.thresholdInclude),
          min: this._fb.control(clause.threshold),
          maxIncluded: this._fb.control(clause.thresholdIncludeUp),
          max: this._fb.control(clause.thresholdUp),
          startBrackets: this._fb.control(clause.startBrackets),
          endBrackets: this._fb.control(clause.endBrackets),
          externalOperation: this._fb.control(clause.externalOperation)
        }) as ClauseFormGroup);

        this.selectedDimensionValuesMap.set(id, new Map());

        this.groupByForm.get('groupBy')?.value.forEach( (groupBy: any) => {
          let dimensionValuesMap: Map<string, string[]> = this.selectedDimensionValuesMap.get(id)!;
          dimensionValuesMap.set(groupBy, this.dimensionValuesMap.get(groupBy)!);
          this.selectedDimensionValuesMap.set(id, dimensionValuesMap);
        })
      });

      this.severityOptions.find((opt) => opt.value == condition.severity).disabled = false;
      
      this.conditionTextMap.set(i, this.generateConditionText(i));
    });

    //ACTIVATION AND RECOVERY
    this.activationRecoverForm.get('activation1')?.setValue(this.activationRecoverEvaluationOptions.find((opt) => opt.value == alertViewDto.alarmNumPeriods));
    this.activationRecoverForm.get('activation2')?.setValue(this.activationRecoverEvaluationOptions.find((opt) => opt.value == alertViewDto.alarmTotalPeriods));
    this.activationRecoverForm.get('recover1')?.setValue(this.activationRecoverEvaluationOptions.find((opt) => opt.value == alertViewDto.recoveryNumPeriods));
    this.activationRecoverForm.get('recover2')?.setValue(this.activationRecoverEvaluationOptions.find((opt) => opt.value == alertViewDto.recoveryTotalPeriods));

    //SILENCE PERIODS
    alertViewDto.silencePeriods?.forEach((silencePeriod) => {
      let splittedStartTime: string[] = silencePeriod.startTime.split(':');
      let splittedEndTime: string[] = silencePeriod.endTime.split(':');
      const group: SilencePeriodFormGroup = this._fb.group({
        id: this._fb.control((this.silencePeriodArray.length + 1).toString()),
        days: this._fb.control(silencePeriod.days),
        from: this._fb.control(new Date(2025, 1, 1, Number(splittedStartTime[0]), Number(splittedStartTime[1]), Number(splittedStartTime[2]))),
        to: this._fb.control(new Date(2025, 1, 1, Number(splittedEndTime[0]), Number(splittedEndTime[1]), Number(splittedEndTime[2]))),
        stored: this._fb.control(true)
      },
      {
        validators: this.timeValidator
      }) as SilencePeriodFormGroup;

      group.get('from')?.valueChanges.subscribe(() => group.updateValueAndValidity());
      group.get('to')?.valueChanges.subscribe(() => group.updateValueAndValidity());

      this.silencePeriodArray.push(group);
    });

    //ENDPOINTS
    alertViewDto.endpoints?.forEach((endpoint) => {
      
      this.endpointsByTypeMap[endpoint.type].forEach((ept: any) => {
        if (ept.id == endpoint.endpointId)
        {
          let severityList: any[] = [];

          endpoint.severities!.forEach((svrt) => {
            severityList.push(this.severityOptions.find((opt) => opt.value == svrt));
          });

          this.endpointList.push(new Endpoint(endpoint.id!, this.endpointTypeOptions.find((opt) => opt.value == endpoint.type), ept, severityList));
        }
      })
    });

    //ALERT TAGS
    alertViewDto.alertTags?.forEach((tag) => {
      this.tagList.push(new Tag(tag.name!, tag.value!));
    });

    //NOTIFICATIONS
    this.notificationMessageForm.get('message')?.setValue(alertViewDto.alertText ? alertViewDto.alertText : '');
    this.notificationMessageForm.get('details')?.setValue(alertViewDto.alertDetail ? alertViewDto.alertDetail : '');
    this.notificationMessageForm.get('proccedure')?.setValue(alertViewDto.opiUrl ? alertViewDto.opiUrl : '');

    //PERMISSIONS
    for (let i = 0; i < alertViewDto.permissions!.length; i++)
    {
      this.permissionList.push(new Permission(alertViewDto.permissions![i].id, this.teamList.find((team) => team.id == alertViewDto.permissions![i].teamId), this.permissionTypeOptions.find((permissionType) => alertViewDto.permissions![i].writePermission ? permissionType.value == 'rw' : permissionType.value == 'r')))
      this.teamList[this.teamList.findIndex(team => team.id == alertViewDto.permissions![i].teamId)].disabled = true;
    }
  }

  onClickConfirmCrupdateAlert() 
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
      alertPermissions.push(new AlertPermissionDto(permission.id, permission.type.value.includes('rw') ? true : false, permission.team.id));
    }

    //CONDITION HISTORIES
    let alertConditionHistories: AlertConditionHistoryDto[] = [];

    //ENDPOINTS
    let endpointAlerts: EndpointAlertDto[] = [];

    for (let endpoint of this.endpointList) 
    {
      let endpointAlert: EndpointAlertDto = new EndpointAlertDto(endpoint.id, endpoint.severities.map(severity => severity.value), endpoint.endpoint.id);
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
          alertSilences.push(new AlertSilenceDto(null, days[i].value, fromHour+':'+fromMinutes, toHour+':'+toMinutes));
        }
      }
    }

    //INDICATORS
    let alertIndicators: AlertIndicatorDto[] = [];

    for (let indicator of this.indicatorArray.controls)
    {
      //METRICS
      let alertMetrics: AlertMetricDto[] = [];

      for (let metric of indicator.controls.metrics.controls) 
      {
        if (metric.get('metric')?.value != null)
        {
          alertMetrics.push(new AlertMetricDto(metric.get('metricId')?.value!, metric.get('metric')?.value!.bbdd!, metric.get('metric')?.value!.table_name!, metric.get('metric')?.value!.metric!, metric.get('operation')?.value!.value!));
        }
      }

      alertIndicators.push(new AlertIndicatorDto(indicator.get('id')?.value!, indicator.get('name')?.value!, alertMetrics, indicator.get('finalExpression')?.value!));
    }

    //CONDITIONS
    let alertConditions: AlertConditionDto[] = [];

    for (let condition of this.conditionArray.controls) {
      let alertClauses: AlertClauseDto[] = [];

      //CLAUSES
      for (let clause of condition.controls.clauses.controls) {
        let conditionFilters: ConditionFilterDto[] = [];
        let dimensionValuesMap: Map<string, string[]> = this.selectedDimensionValuesMap.get(clause.get('id')?.value!)!;

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

        alertClauses.push(new AlertClauseDto(clause.get('clauseId')?.value!, clause.get('indicatorName')?.value!, clause.get('startBrackets')?.value!, clause.get('comparation')?.value.value, clause.get('comparation')?.value.value == "MORE_THAN" || clause.get('comparation')?.value.value == "LESS_THAN" ? clause.get('value')?.value! : clause.get('min')?.value!, clause.get('endBrackets')?.value!, clause.get('order')?.value!, clause.get('externalOperation')?.value!, clause.get('minIncluded')?.value!, clause.get('max')?.value!, clause.get('maxIncluded')?.value!, conditionFilters));
      }

      alertConditions.push(new AlertConditionDto(condition.get('conditionId')?.value!, condition.get('severity')?.value.value, condition.get('status')?.value!, alertClauses));
    }

    //ALERTA
    let alertDto: AlertDto = new AlertDto(
      this.internalName,
      this.name,
      this.notificationMessageForm.get('message')?.value,
      this.notificationMessageForm.get('details')?.value,
      this.tagList,
      this.advancedOptionsForm.get('periodicity')?.value.value,
      this.advancedOptionsForm.get('timeWindow')?.value.value,
      this.alertType == 'simple' ? 0 : this.alertType == 'composite' ? 1 : this.alertType == 'logs' ? 2 : 3,
      this.advancedOptionsForm.get('discardTime')?.value.value,
      this.groupByForm.get('groupBy')?.value,
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

    this.alertService.crupdateAlert(this.mode == 'create' ? null : this.alertId, alertDto).subscribe(
      (response) => 
      {
        if (response.status == 'DISABLED')
          this.dolphinError = true;

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

  onClickGoToAlert()
  {
    this.router.navigate(['alerts'], { state: { alertId: this.configuredAlertExists } });
  }

  addStartBracket(clauseIndex: number, conditionIndex: number) 
  {
    this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('startBrackets')?.setValue((this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('startBrackets')?.value || 0) + 1);
  }

  removeStartBracket(clauseIndex: number, conditionIndex: number) {
    if ((this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('startBrackets')?.value || 0) > 0)
    {
      this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('startBrackets')?.setValue((this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('startBrackets')?.value || 0) - 1);
    }
  }

  addEndBracket(clauseIndex: number, conditionIndex: number) {
    this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('endBrackets')?.setValue((this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('endBrackets')?.value || 0) + 1);
  }

  removeEndBracket(clauseIndex: number, conditionIndex: number) {
    if ((this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('endBrackets')?.value || 0) > 0)
    {
      this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('endBrackets')?.setValue((this.conditionArray.at(conditionIndex).controls.clauses.at(clauseIndex).get('endBrackets')?.value || 0) - 1);
    }
  }

  rebindExprValidator(indicatorIndex: number) {
    const grp = this.indicatorArray.at(indicatorIndex) as FormGroup;
    const metrics = grp.get('metrics') as FormArray;
    const finalCtrl = grp.get('finalExpression') as FormControl;
    const n = metrics.length; // índices válidos: 1..n

    finalCtrl.setValidators([Validators.required, algebraExprValidator(n)]);
    finalCtrl.updateValueAndValidity({ emitEvent: false });
  }

  checkAllFinalExpressions(): boolean 
  {
    let allValid = true;

    this.indicatorArray.controls.forEach((ctrl, index) => {
      const grp = ctrl as FormGroup;
      const metrics = grp.get('metrics') as FormArray | null;
      const finalCtrl = grp.get('finalExpression') as FormControl | null;

      if (!finalCtrl) {
        allValid = false;
        return;
      }

      const n = metrics?.length ?? 0;

      // Rebind validador (required + algebra)
      finalCtrl.setValidators([Validators.required, algebraExprValidator(n)]);
      finalCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

      // Marca para que se muestren errores en UI
      finalCtrl.markAsTouched({ onlySelf: true });
      finalCtrl.markAsDirty({ onlySelf: true });

      if (finalCtrl.invalid) {
        allValid = false;
      }
    });

    return allValid;
  }
}
