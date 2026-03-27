import { Component, HostListener, OnInit } from '@angular/core';
import { PageWrapperComponent } from '../../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from '../../../shared/components/accordion/accordion.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, Validators, FormArray, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { MultiSelect, MultiSelectChangeEvent, MultiSelectFilterEvent, MultiSelectModule } from 'primeng/multiselect';
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
import { endpointTypeOptions } from '../../../shared/constants/addressee-options';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { FloatingGraphComponent } from '../../../shared/components/floating-graph/floating-graph.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { BehaviorSubject, catchError, concatMap, debounceTime, filter, finalize, firstValueFrom, forkJoin, from, map, mergeMap, Observable, of, startWith, Subject, Subscription, switchMap, take, tap } from 'rxjs';
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
import { EndpointAlertDto } from '../../../shared/dto/EndpointAlertDto';
import { AlertService } from '../../../shared/services/alert.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { EndpointService } from '../../../shared/services/endpoint.service';
import { EndpointViewDto } from '../../../shared/dto/endpoint/EndpointViewDto';
import { TeamViewDto } from '../../../shared/dto/TeamViewDto';
import { AuthService } from '../../../shared/services/auth.service';
import { AlertViewDto } from '../../dto/alert/AlertViewDto';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AutoCompleteModule } from 'primeng/autocomplete';

import {matOperationOptions, 
        timeWindowOptions, 
        discardTimeOptions, 
        periodicityOptions,
        advancedSearchOptions, 
        severityOptions, 
        clauseComparationOptions, 
        activationRecoverEvaluationOptions, 
        silencePeriodDayOptions,
        baselinesVariablesConditionTypes,
        baselinesComparationTypes,
        baselinesClauseComparationOptions,
        dimensionValuesInclusionOptions
      } from '../../constants/alert-constants';
import { AlertOcurrencesService } from '../../services/alert-ocurrences.service';
import { ConditionFilterDto } from '../../dto/ConditionFilterDto';
import { SelectedDimensionDto } from '../../dto/SelectedDimensionDto';
import { DistinctValuesRequest } from '../../dto/DistinctValuesRequest';
import { InventoryBaselinesService } from '../../services/inventory-baselines.service';
import { BaselinesVariablesDto } from '../../dto/BaselinesVariablesDto';
import { BaselineResponse } from '../../responses/baselines/BaselineResponse';
import { GraphSerieResponse } from '../../responses/plotting/GraphSerieResponse';
import { PlottingService } from '../../services/plotting.service';
import { GraphRequest } from '../../requests/GraphRequest';
import { DimensionValuesRequest } from '../../requests/baseline/DimensionValuesRequest';
import { AlertIndicatorViewDto } from '../../dto/alert/AlertIndicatorViewDto';
import { DimensionValuesRequest as AlertDimensionValuesRequest } from '../../../shared/dto/alert/dimension/DimensionValuesRequest';
import { DimensionValuesMetricRequest } from '../../../shared/dto/alert/dimension/DimensionValuesMetricRequest';
import { DimensionValuesAgroupationRequest } from '../../../shared/dto/alert/dimension/DimensionValuesAgroupationRequest';
import { DimensionValuesResponse } from '../../dto/alert/dimension/DimensionValuesResponse';

type TokType = 'VAR' | 'NUM' | 'OP' | 'LPAREN' | 'RPAREN';
interface Tok { type: TokType; value: string }

function makeIdxAlternatives(n: number): string {
  return Array.from({ length: n }, (_, i) => String(n - i)).join('|'); // n|...|2|1
}

/** Regex de tokens válidos: variables [A-Z].(1..n), números, + - * / %, paréntesis y espacios */
export function makeTokenRegex(n: number): RegExp {
  if (n < 1) throw new Error('n debe ser >= 1');
  const idx = makeIdxAlternatives(n);
  const num = String.raw`(?:\d+(?:\.\d+)?|\.\d+)`; // 100 | 3.5 | .5
  const pattern = String.raw`^(?:\s*(?:\(|\)|[+\-*/%]|[A-Z]\.(?:${idx})|${num})\s*)+$`;
  return new RegExp(pattern);
}

/** Tokenizador (consume con flag 'y') */
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

/** Chequeo de gramática SIN unario. Devuelve el tipo de error si falla. */
function checkGrammar(expr: string): { ok: true } | { ok: false; error: 'unary' | 'order' } {
  const toks = tokenize(expr);

  // Debe tokenizarse todo: si hay basura, es error de orden
  const joined = toks.map(t => t.value).join('');
  const stripped = expr.replace(/\s+/g, '');
  if (joined.length !== stripped.length) return { ok: false, error: 'order' };

  let expectOperand = true; // al inicio se espera operando
  const stack: string[] = [];

  for (const t of toks) {
    if (expectOperand) {
      if (t.type === 'VAR' || t.type === 'NUM') {
        expectOperand = false;
      } else if (t.type === 'LPAREN') {
        stack.push('(');
        // seguimos esperando operando tras '('
      } else if (t.type === 'OP' && (t.value === '+' || t.value === '-')) {
        // AQUÍ detectaríamos unario: está prohibido
        return { ok: false, error: 'unary' };
      } else {
        // operador binario (* / %) o ')' donde debía ir un operando
        return { ok: false, error: 'order' };
      }
    } else {
      if (t.type === 'OP') {
        expectOperand = true; // tras operador binario, esperamos operando
      } else if (t.type === 'RPAREN') {
        if (stack.length === 0) return { ok: false, error: 'order' };
        stack.pop();
        // seguimos sin esperar operando (puede venir OP o ')')
      } else {
        // dos operandos seguidos o '(' después de operando
        return { ok: false, error: 'order' };
      }
    }
  }

  // Debe terminar en operando o ')', y paréntesis balanceados
  if (expectOperand || stack.length !== 0) return { ok: false, error: 'order' };
  return { ok: true };
}

/** Validador completo: tokens válidos, única letra, índices 1..n, SIN unario, gramática correcta */
export function algebraExprValidator(n: number): ValidatorFn {
  const tokenRe = makeTokenRegex(n);
  const varRe = /\b([A-Z])\.(\d+)\b/g;

  return (control: AbstractControl) => {
    const raw = (control.value ?? '') as string;
    const value = raw.trim();

    // Si quieres marcar vacío como error aquí:
    // if (!value) return { required: true };
    // O usa Validators.required en el control (recomendado)

    if (!value) return null; // deja el required a otro validador

    // 1) Solo tokens permitidos
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

    // 3) Gramática sin unario
    const g = checkGrammar(value);
    if (!g.ok) {
      return g.error === 'unary' ? { unaryNotAllowed: true } : { invalidOrder: true };
    }

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
  type: string;

  constructor(name: string, value: string, type: string) {
    this.name = name;
    this.value = value;
    this.type = type;
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
  name: FormControl<string>;
  metric: FormControl<TableMetricInfo | null>;
  operation: FormControl<any>;
  options: FormControl<TableMetricInfo[]>;
  idInventory: FormControl<number | null>;
}>;

type IndicatorFormGroup = FormGroup<{
  id: FormControl<number | null>;
  name: FormControl<string>;
  metrics: FormArray<MetricFormGroup>;
  finalExpression: FormControl<string>;
}>;

type IndicatorFormArray = FormArray<IndicatorFormGroup>;

// LOGS

type LogConditionFormGroup = FormGroup<{
  logConditionId: FormControl<number | null>;
  externalOperation: FormControl<string | null>;
  field: FormControl<string | null>;
  comparation: FormControl<any>;
  value: FormControl<string | null>;
  dimensions: FormControl<string[] | null>;
}>;

type LogConditionFormArray = FormArray<LogConditionFormGroup>;

// END_LOGS

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
  externalOperation: FormControl<string | null>
}>;

type ConditionFormGroup = FormGroup<{
  conditionId: FormControl<number | null>;
  id: FormControl<string>;
  severity: FormControl<any>;
  status: FormControl<boolean>;
  clauses: FormArray<ClauseFormGroup>;
  baselineVariables: FormGroup;
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
  imports: [FloatingGraphComponent, ProgressSpinnerModule, ToggleSwitchModule, SkeletonModule, DialogModule, PageWrapperComponent, ReactiveFormsModule, ModalComponent, TabsModule, TextareaModule, ButtonModule, CommonModule, AccordionComponent, MultiSelectModule, FormsModule, FluidModule, SelectModule, TooltipModule, InputTextModule, SanitizeExpressionPipe, FloatLabelModule, InputNumberModule, InnerAccordionComponent, CheckboxModule, DatePickerModule, RadioButtonModule, AutoCompleteModule],
  templateUrl: './alert-manager.component.html',
  styleUrl: './alert-manager.component.scss'
})
export class AlertManagerComponent implements OnInit{

  // General
  alertId: number = 0;
  mode: string = 'create';
  subscriptions: Subscription[] = [];

  alertResponseLoading: boolean = false;
  alertResponseError: boolean = false;

  isSimpleConditionAlert: boolean = false;
  isCompositeConditionAlert: boolean = false;
  isLogsAlert: boolean = false;
  isBaselineAlert: boolean = false;
  isBaselinePastAverageAlert: boolean = false;
  isBaselinePastAveragePonderedAlert: boolean = false;
  isBaselineKSigmaAlert: boolean = false;

  baselineIndicator: AlertIndicatorViewDto | null = null;

  isInitialMetricListLoading: boolean = false;

  graphSeriesLoading: boolean = false;
  graphSeriesError: boolean = false;
  graphSeries: GraphSerieResponse[] = [];
  graphGroupBy: Map<string, string[]> = new Map<string, string[]>();
  requestGraphGroupBy: Map<string, string[]> = new Map<string, string[]>();

  conditionGraphList: any[] = [];

  hours: number = 24;

  requiredDataPanelVisible: boolean = true;

  corruptedAlert: boolean = false;

  // Step 1
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

  dimensionIntersectionOptions: string[] = [];
  allDimensionValuesLoading: boolean = false;
  allDimensionValuesError: boolean = false;

  conditionFiltersMap: Map<string, Map<string, Map<string, string[]>>> = new Map();
  conditionFiltersInclusionTypeMap: Map<string, Map<string, any>> = new Map();
  lastFilter: string = '';

  // Map<conditionId, Map<dimension, expanded>>
  dimensionFilterExpandedMap: Map<string, Map<string, boolean>> = new Map();
  // Map<conditionId, Map<dimension, { type: 'CONTAINS'|'NOT_CONTAINS', value: string, externalOperation: 'AND'|'OR' }>>
  dimensionContainsFilterMap: Map<string, Map<string, { type: string; value: string; externalOperation: string }>> = new Map();

  timeWindowOptions: any[] = [];
  discardTimeOptions: any[] = [];
  periodicityOptions: any[] = [];

  groupByForm: FormGroup;
  advancedOptionsForm: FormGroup;

  // LOGS
  logsStep1Form: FormGroup;
  advancedSearchOptions: any[] = [];

  logsConditionArray: LogConditionFormArray;
  logsDimensionsIntersectionOptions: any[] = [];

  catalogLoaded = new BehaviorSubject<boolean>(false);
  metricsLoaded = new BehaviorSubject<boolean>(false);

  endpointsLoaded = new BehaviorSubject<boolean>(false);
  teamsLoaded = new BehaviorSubject<boolean>(false);

  // BASELINE
  baselinesListLoading: boolean = false;
  baselinesListError: boolean = false;
  baselineResponseList: BaselineResponse[] = [];
  selectedBaseline: any = null;
  baselineSelectDisabled: boolean = false;

  baselineGroupByOptionsLoading: boolean = false;
  baselineGroupByOptionsError: boolean = false;

  // Step 2
  conditionInformationModalStyle: any = {};
  conditionInformationModalVisible: boolean = false;

  severityOptions: any[] = [];
  clauseComparationOptions: any[] = [];
  conditionArray: ConditionFormArray;
  lastThresholdArrayLength: number = 0;

  dimensionValuesInclusionOptions: any[] = [];

  conditionTextMap: Map<number, string> = new Map();

  externalOperationOptions: string[] = ['AND', 'OR'];

  activationRecoverEvaluationOptions: any[] = [];
  activationRecoverForm: FormGroup;

  silencePeriodDayOptions: any[] = [];
  silencePeriodArray: SilencePeriodFormArray;

  errorBehaviorOptions: any[] = [];
  errorBehaviorForm: FormGroup;

  // BASELINE
  baselinesClauseComparationOptions: any[] = [];
  baselinesVariablesConditionTypes: any[] = [];
  baselinesComparationTypes: any[] = [];

  // Step 3
  endpointsByTypeMap: any;
  endpointFieldValues: EndpointViewDto[] = [];
  endpointForm: FormGroup;

  endpointList: Endpoint[] = [];

  endpointTypeOptions: any[] = [];

  tagForm: FormGroup;
  selectedTagIndex: number | null = null;
  tagList: Tag[] = [];

  tagNames: string[] = ['bolt_source', 'bolt_service', 'bolt_funcion', 'bolt_data_type', 'bolt_category', 'bolt_host', 'bolt_ob'];
  tagFilteredNames: any[] = ['bolt_source', 'bolt_service', 'bolt_funcion', 'bolt_data_type', 'bolt_category', 'bolt_host', 'bolt_ob'];

  messageInformationModalStyle: any = {};
  messageInformationModalVisible: boolean = false;

  conditionalBlockOptions: any[] = [];
  templateVariableOptions: any[] = [];

  @HostListener('document:click', ['$event']) clickout(event: Event) { this.messageModalVisible = false; this.detailsModalVisible = false; }
  @HostListener('document:scroll', ['$event']) scrollout(event: Event) { this.messageModalVisible = false; this.detailsModalVisible = false; }
  messageDialogStyle: any = {};
  detailsDialogStyle: any = {};
  messageTokenIndex: number = 1;
  messageModalVisible: boolean = false;
  detailsModalVisible: boolean = false;
  previousMessageValue: string = '';
  previousDetailsValue: string = '';
  notificationMessageForm: FormGroup;

  // Step 4
  permissionInformationModalStyle: any = {};
  permissionInformationModalVisible: boolean = false;

  permissionTypeOptions: any[] = [];
  permissionList: Permission[] = [];
  teamList: TeamViewDto[] = [];

  // Modal
  modalVisible: boolean = false;
  isDetails: boolean = false;
  isLoading: boolean = false;
  isSuccess: boolean = false;
  dbError: boolean = false;
  dolphinError: boolean = false;

  // LOGS
  dataTypesLoading: boolean = false;
  dataTypesError: boolean = false;
  dataTypesList: string[] = [];

  tableNamesByDataTypeLoading: boolean = false;
  tableNamesByDataTypeError: boolean = false;
  tableNamesByDataTypeList: string[] = [];

  metricsByDataTypeAndTableLoading: boolean = false;
  metricsByDataTypeAndTableError: boolean = false;
  metricsByDataTypeAndTableList: string[] = [];

  dimensionsByDataTypeTableAndMetricLoading: boolean = false;
  dimensionsByDataTypeTableAndMetricError: boolean = false;
  dimensionsByDataTypeTableAndMetricList: string[] = [];

  constructor(
    private router: Router,
    private _fb: FormBuilder,
    private metricService: MetricService,
    private alertService: AlertService,
    private endpointService: EndpointService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private alertOcurrencesService: AlertOcurrencesService,
    private inventoryBaselinesService: InventoryBaselinesService,
    private plottingService: PlottingService) {

    this.route.snapshot.paramMap.has('alert_id') ? this.mode = 'edit' : this.mode = 'create';

    if (this.route.snapshot.paramMap.has('alert_type'))
    {
      switch (this.route.snapshot.params['alert_type'])
      {
        case 'simple':
          this.isSimpleConditionAlert = true;
          break;

        case 'composite':
          this.isCompositeConditionAlert = true;
          break;

        case 'logs':
          this.isLogsAlert = true;
          break;

        case 'baseline':
          this.isBaselineAlert = true;
          if (this.route.snapshot.paramMap.has('alert_subtype'))
          {
            switch (this.route.snapshot.params['alert_subtype'])
            {
              case 'past-average':
                this.isBaselinePastAverageAlert = true;
                break;

              case 'past-average-pondered':
                this.isBaselinePastAveragePonderedAlert = true;
                break;

              case 'k-sigma':
                this.isBaselineKSigmaAlert = true;
                break;
            }
          }
        break;
      }
    }

    if (this.mode == 'edit')
    {
      this.alertId = this.route.snapshot.params['alert_id'];
    }

    // Step 1
    this.indicatorArray = this._fb.array<IndicatorFormGroup>([]);

    this.groupByForm = this._fb.group({
      groupBy: [[], []]
    });

    this.advancedOptionsForm = this._fb.group({
      timeWindow: [timeWindowOptions[1], [Validators.required]],
      discardTime: [discardTimeOptions[0], [Validators.required]],
      periodicity: [periodicityOptions[1], [Validators.required]]
    });

    // LOGS
    this.logsStep1Form = this._fb.group({
      service: ['', [Validators.required]],
      catalog: [{value: '', disabled: true}, [Validators.required]]
    });

    this.logsConditionArray = this._fb.array<LogConditionFormGroup>([]);

    // Step 2
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

    // Step 3

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
      opiUrl: ['', []]
    });
  }

  ngOnInit(): void {

    this.severityOptions = severityOptions;

    if (this.route.snapshot.paramMap.has('alert_id'))
    {
      this.getAlert();

      if (this.isLogsAlert)
      {
        this.getDistinctDataTypes();
      }
    }
    else
    {
      if (this.isSimpleConditionAlert || this.isCompositeConditionAlert)
      {
        this.createIndicator();
      }
      else if (this.isLogsAlert)
      {
        this.getDistinctDataTypes();
        this.createLogCondition();
      }
      else if (this.isBaselineAlert)
      {
        this.getBaselines();
        this.indicatorNames.push('A');
      }

      this.createCondition();
      this.createSilencePeriod();

      this.resetSeverityOptions();
    }

    // Step 1

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

    // LOGS
    this.advancedSearchOptions = advancedSearchOptions;

    // Step 2
    this.clauseComparationOptions = clauseComparationOptions;

    this.dimensionValuesInclusionOptions = dimensionValuesInclusionOptions;

    this.activationRecoverEvaluationOptions = activationRecoverEvaluationOptions;

    this.silencePeriodDayOptions = silencePeriodDayOptions;

    this.errorBehaviorOptions = errorBehaviorOptions;

    // BASELINES
    this.baselinesClauseComparationOptions = baselinesClauseComparationOptions;
    this.baselinesVariablesConditionTypes = baselinesVariablesConditionTypes;
    this.baselinesComparationTypes = baselinesComparationTypes;

    // Step 3
    this.getEndpointsByType();

    this.endpointTypeOptions = endpointTypeOptions;

    // Step 4
    this.permissionTypeOptions = permissionTypeOptions;
    this.getAllTeams();
  }

  getAlert() {
    this.alertResponseLoading = true;
    this.alertResponseError = false;
    this.alertService.getAlert(this.alertId).subscribe(
      (response) => { this.fromDtoToForm(response); this.alertResponseLoading = false; },
      () => { this.alertResponseLoading = false; this.alertResponseError = true; }
    );
  }

  onClickNavigateToCreateAlert() { this.router.navigate(['alert/create']); }
  onClickNavigateToAlerts() { this.router.navigate(['alerts']); }

  generateInternalNameAndName() {
    this.internalName = '';
    this.name = '';

    if (this.isSimpleConditionAlert || this.isCompositeConditionAlert) {
      const metricNames = this.indicatorArray.controls.flatMap(ind =>
        ind.controls.metrics.controls.map(m => m.get('metric')?.value?.metric!)
      );
      this.internalName = this.name = metricNames.join('_');
    } else if (this.isLogsAlert) {
      this.internalName = this.name = `${this.logsStep1Form.get('service')?.value}_${this.logsStep1Form.get('catalog')?.value}`;
    } else if (this.isBaselineAlert) {
      this.internalName = this.name = this.selectedBaseline.name;
    }

    const groupBy: string[] = this.groupByForm.get('groupBy')?.value ?? [];
    if (groupBy.length > 0) this.internalName += '_' + groupBy.join('_');

    if (this.mode === 'create' && !this.authService.isAdmin()) this.existsByInternalName();
  }

  existsByInternalName() {
    this.alertService.existsByInternalName(this.internalName).subscribe(
      (response: any) => { this.configuredAlertExists = response; }
    );
  }

  // INDICATORS
  createIndicator() {
    const i = this.indicatorArray.length;
    const group = this._fb.group({
      id: this._fb.control(null),
      name: this._fb.control(this.letters[i]),
      metrics: this._fb.array<MetricFormGroup>([]),
      finalExpression: this._fb.control(''),
    }) as IndicatorFormGroup;
    this.indicatorArray.push(group);
    this.createMetric(i);
    this.indicatorNames.push(this.letters[i]);
  }

  removeIndicator(indicatorIndex: number) {
    this.indicatorArray.removeAt(indicatorIndex);
    this.indicatorNames = [];
    this.indicatorArray.controls.forEach((ind, i) => {
      ind.get('name')?.setValue(this.letters[i]);
      this.indicatorNames.push(this.letters[i]);
    });
    this.generateDimensionIntersection();
    this.resultMetricMap.delete(indicatorIndex);
    this.conditionArray.controls.forEach(cond =>
      cond.controls.clauses.controls.forEach(c => c.get('indicatorName')?.setValue(this.letters[0]))
    );
  }

  createMetric(indicatorIndex: number) {
    const ind = this.indicatorArray.at(indicatorIndex);
    const len = ind.controls.metrics.length;
    ind.controls.metrics.push(this._fb.group({
      metricId: this._fb.control(null),
      id: this._fb.control((len + 1).toString()),
      name: this._fb.control(`${this.letters[indicatorIndex]}.${len + 1}`),
      metric: this._fb.control(TableMetricInfo),
      operation: this._fb.control(matOperationOptions[1]),
      options: this._fb.control([] as TableMetricInfo[]),
      idInventory: this._fb.control(null)
    }) as MetricFormGroup);
    this.rebindExprValidator(indicatorIndex);
    this.generateFinalExpression(indicatorIndex);
  }

  private generateFinalExpression(indicatorIndex: number): string {
    const expression = this.indicatorArray.at(indicatorIndex).controls.metrics.controls
      .map(m => m.get('name')?.value ?? '').join('+');
    this.resultMetricMap.set(indicatorIndex, expression);
    this.resultMetricEditionMap.set(indicatorIndex, false);
    this.indicatorArray.at(indicatorIndex).get('finalExpression')?.setValue(expression);
    return expression;
  }

  removeMetric(indicatorIndex: number, metricIndex: number) {
    this.indicatorArray.at(indicatorIndex).controls.metrics.removeAt(metricIndex);
    this.indicatorArray.at(indicatorIndex).controls.metrics.controls.forEach((m, i) => {
      m.get('id')?.setValue((i + 1).toString());
      m.get('name')?.setValue(`${this.letters[indicatorIndex]}.${i + 1}`);
    });
    this.generateDimensionIntersection();
    this.generateInternalNameAndName();
    this.rebindExprValidator(indicatorIndex);
    this.generateFinalExpression(indicatorIndex);
    this.getGraphSeries();
    if (this.mode === 'create') this.generateMetricTags();
  }

  onChangeMetricSelect() {
    this.generateInternalNameAndName();
    this.generateDimensionIntersection();
    if (this.mode === 'create') this.getGraphSeries();
    this.conditionFiltersMap = new Map();
    this.conditionArray.controls.forEach((c: ConditionFormGroup) => this.resetConditionFilters(c));
    const newGroupBy = (this.groupByForm.get('groupBy')?.value as string[])
      .filter(dim => !this.dimensionIntersectionOptions.includes(dim))
      .map(dim => dim.toLowerCase());
    this.groupByForm.get('groupBy')?.setValue(newGroupBy);
    if (this.mode === 'create') this.generateMetricTags();
  }

  createLogCondition() {
    this.logsConditionArray.push(this._fb.group({
      logConditionId: this._fb.control(null),
      externalOperation: this._fb.control('AND'),
      field: this._fb.control({ value: null, disabled: !this.logsStep1Form.get('catalog')?.value }, [Validators.required]),
      comparation: this._fb.control(advancedSearchOptions[0]),
      value: this._fb.control(''),
      dimensions: this._fb.control([] as string[])
    }) as LogConditionFormGroup);
  }

  removeLogCondition(logConditionIndex: number) {
    this.logsConditionArray.removeAt(logConditionIndex);
    this.getLogsDimensionsIntersection();
  }

  generateDimensionIntersection() {
    let intersection: Set<string> | null = null;
    this.indicatorArray.controls.forEach(ind => {
      ind.get('metrics')?.value.forEach((m: any) => {
        if (m?.metric && Array.isArray(m.metric.dimension)) {
          const cur = new Set<string>(m.metric.dimension);
          intersection = intersection === null ? cur : new Set([...intersection].filter(d => cur.has(d)));
        }
      });
    });
    if (intersection) this.dimensionIntersectionOptions = Array.from(intersection as Set<string>).map(d => d.toLowerCase());
  }

  generateConditionText(conditionIndex: number): string {
    let text = '';
    this.conditionArray.at(conditionIndex).controls.clauses.controls.forEach((clause, ci) => {
      if (ci > 0) text += ` ${clause.get('externalOperation')?.value ?? ''} `;
      const sb = clause.get('startBrackets')?.value ?? 0;
      const eb = clause.get('endBrackets')?.value ?? 0;
      if (sb > 0) text += '( '.repeat(sb);
      text += this.isBaselineAlert ? 'Baseline' : (clause.get('indicatorName')?.value ?? '');
      const comp = clause.get('comparation')?.value.value;
      if (comp === 'MORE_THAN') text += ` > ${clause.get('value')?.value ?? '?'}`;
      else if (comp === 'LESS_THAN') text += ` < ${clause.get('value')?.value ?? '?'}`;
      else if (comp === 'EQUALS') text += ` = ${clause.get('value')?.value ?? '?'}`;
      else if (comp === 'NOT_EQUALS') text += ` != ${clause.get('value')?.value ?? '?'}`;
      else if (comp === 'WITHIN_RANGE' || comp === 'OUT_OF_RANGE') {
        const lb = clause.get('minIncluded')?.value ? '[' : '(';
        const rb = clause.get('maxIncluded')?.value ? ']' : ')';
        text += ` ${comp === 'WITHIN_RANGE' ? 'entre' : 'fuera de'} ${lb} ${clause.get('min')?.value ?? '?'} , ${clause.get('max')?.value ?? '?'} ${rb}`;
      }
      if (eb > 0) text += ' )'.repeat(eb);
    });
    return text;
  }

  removeClause(conditionIndex: number, clauseIndex: number) {
    this.conditionArray.at(conditionIndex).controls.clauses.removeAt(clauseIndex);
    if (this.conditionArray.at(conditionIndex).controls.clauses.length === 0 && !this.isBaselineAlert)
      this.conditionArray.at(conditionIndex).controls.clauses.at(0).get('externalOperation')?.setValue(null);
    this.buildConditionGraphsList();
  }

  createCondition() {
    const group = this._fb.group({
      conditionId: this._fb.control(null),
      id: this._fb.control((this.conditionArray.length + 1).toString()),
      severity: this._fb.control(severityOptions[0]),
      status: this._fb.control(true),
      clauses: this._fb.array<ClauseFormGroup>([]),
      baselineVariables: this._fb.group({
        baselinesVariablesId: [null],
        type: [baselinesVariablesConditionTypes[0]],
        auxVar1: [], auxVar2: [], auxVar3: []
      })
    }) as ConditionFormGroup;
    this.conditionArray.push(group);

    const cur = this.conditionArray.at(this.conditionArray.length - 1);

    if (this.isBaselineAlert) {
      const baselineFg = cur.get('baselineVariables') as FormGroup;
      const typeCtrl = baselineFg.get('type');
      const sub = typeCtrl!.valueChanges.pipe(startWith(typeCtrl!.value)).subscribe((typeValue: any) => {
        const [auxVar1, auxVar2, auxVar3] = ['auxVar1', 'auxVar2', 'auxVar3'].map(k => baselineFg.get(k));
        [auxVar1, auxVar2, auxVar3].forEach(c => c?.clearValidators());
        const comp = typeValue?.value ?? typeValue;
        if (this.isBaselinePastAverageAlert) {
          if (comp === 'LESS_THAN') auxVar1?.setValidators([Validators.required]);
          else if (comp === 'MORE_THAN') auxVar2?.setValidators([Validators.required]);
          else { auxVar1?.setValidators([Validators.required]); auxVar2?.setValidators([Validators.required]); }
        } else if (this.isBaselinePastAveragePonderedAlert) {
          [auxVar1, auxVar2, auxVar3].forEach(c => c?.setValidators([Validators.required]));
        } else if (this.isBaselineKSigmaAlert) {
          auxVar3?.setValidators([Validators.required]);
        }
        [auxVar1, auxVar2, auxVar3].forEach(c => c?.updateValueAndValidity({ emitEvent: false }));
      });
      this.subscriptions.push(sub);
    }

    if (!this.isBaselineAlert) this.createClause(this.conditionArray.length - 1);
    this.lastThresholdArrayLength = this.conditionArray.length;
    this.conditionFiltersMap.set(cur.get('id')?.value!, new Map());

    if (this.isSimpleConditionAlert || this.isCompositeConditionAlert) this.resetConditionFilters(cur);
    else if (this.isLogsAlert) this.resetLogsConditionFilters(cur);
    else this.resetBaselineConditionFilters(cur);
  }

  createClause(conditionIndex: number) {
    const isComp = this.isCompositeConditionAlert;
    const isBase = this.isBaselineAlert;
    const clauses = this.conditionArray.at(conditionIndex).controls.clauses;
    clauses.push(this._fb.group({
      clauseId: this._fb.control(null),
      indicatorName: this._fb.control((this.isSimpleConditionAlert || isComp || isBase) ? 'A' : ''),
      id: this._fb.control((clauses.length + 1).toString()),
      comparation: this._fb.control(clauseComparationOptions[0]),
      order: this._fb.control(this.conditionArray.length + 1),
      value: this._fb.control(null, [Validators.required]),
      minIncluded: this._fb.control(true),
      min: this._fb.control(null),
      maxIncluded: this._fb.control(true),
      max: this._fb.control(null),
      startBrackets: this._fb.control(isComp ? 0 : null),
      endBrackets: this._fb.control(isComp ? 0 : null),
      externalOperation: this._fb.control(isComp || isBase ? 'AND' : null)
    }) as ClauseFormGroup);

    const newClause = clauses.at(clauses.length - 1);
    newClause.valueChanges.subscribe(() => this.conditionTextMap.set(conditionIndex, this.generateConditionText(conditionIndex)));

    const comparationCtrl = newClause.get('comparation');
    const sub = comparationCtrl?.valueChanges.subscribe((comp: any) => {
      const isRange = comp.value === 'WITHIN_RANGE' || comp.value === 'OUT_OF_RANGE';
      const isSimple = comp.value === 'MORE_THAN' || comp.value === 'LESS_THAN' || comp.value === 'EQUALS' || comp.value === 'NOT_EQUALS';
      const valueCtrl = newClause.get('value');
      const minCtrl = newClause.get('min');
      const maxCtrl = newClause.get('max');
      const minInc = newClause.get('minIncluded');
      const maxInc = newClause.get('maxIncluded');
      if (isSimple) {
        valueCtrl?.setValidators(Validators.required);
        [minCtrl, maxCtrl, minInc, maxInc].forEach(c => c?.clearValidators());
      } else if (isRange) {
        valueCtrl?.clearValidators();
        [minCtrl, maxCtrl, minInc, maxInc].forEach(c => c?.setValidators(Validators.required));
      }
      [valueCtrl, minCtrl, maxCtrl, minInc, maxInc].forEach(c => c?.updateValueAndValidity());
    }) as Subscription;
    this.subscriptions.push(sub);
    comparationCtrl?.updateValueAndValidity();
  }

  allConditionsCorrect(): boolean {
    return this.conditionArray.controls.every(c => c.valid && c.controls.clauses.controls.every(cl => cl.valid));
  }

  createSilencePeriod() {
    const group = this._fb.group({
      id: this._fb.control((this.silencePeriodArray.length + 1).toString()),
      days: this._fb.control(null),
      from: this._fb.control(null),
      to: this._fb.control(null),
      stored: this._fb.control(false)
    }, { validators: this.timeValidator }) as SilencePeriodFormGroup;
    ['from', 'to'].forEach(k => group.get(k)?.valueChanges.subscribe(() => group.updateValueAndValidity()));
    this.silencePeriodArray.push(group);
  }

  timeValidator(group: AbstractControl): { [key: string]: any } | null {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;
    return from && to && to <= from ? { horaInvalida: true } : null;
  }

  allSilencePeriodFieldsCompleted(): boolean {
    return this.silencePeriodArray.controls.every(c => {
      const days = c.get('days')?.value;
      return (days?.length ?? 0) > 0 && c.get('from')?.value != null && c.get('to')?.value != null;
    });
  }

  deleteSilencePeriod(i: number) { this.silencePeriodArray.removeAt(i); }

  createPermission() {
    const p = new Permission();
    p.type = this.permissionTypeOptions[1];
    this.permissionList.push(p);
  }

  deletePermission(i: number) {
    if (this.permissionList[i].team)
      this.teamList[this.teamList.findIndex(t => t.id === this.permissionList[i].team.id)].disabled = false;
    this.permissionList.splice(i, 1);
  }

  firstPermissionCompleted(): boolean { return this.permissionList[0]?.team != null; }

  allPermissionsCompleted(): boolean {
    return this.permissionList.every(p => p.team != null && p.type != null);
  }

  onClickSetConditionType(condition: any, type: any) {
    condition.get('severity').setValue(type);
    this.resetSeverityOptions();
  }

  onClickSetEndpointAlert(endpoint: any, alert: any) {
    let alerts: any[] = endpoint.get('alerts')?.value;
    alerts = alerts.includes(alert) ? alerts.filter(a => a !== alert) : [...alerts, alert];
    endpoint.get('alerts')?.setValue(alerts);
  }

  onClickAddTag() {
    this.tagList.push(new Tag(this.tagForm.get('name')?.value, this.tagForm.get('value')?.value, 'CUSTOM'));
    this.tagForm.reset();
    this.tagForm.updateValueAndValidity();
  }

  onClickRemoveTag() {
    if (this.selectedTagIndex !== null) { this.tagList.splice(this.selectedTagIndex, 1); this.resetTagSelection(); }
  }

  onClickCreateAlert() { this.modalVisible = true; }

  ngOnDestroy() { this.subscriptions.forEach(s => s.unsubscribe()); }

  private _verifyTextInput(value: string, input: HTMLTextAreaElement, prev: string, setIndex: (i: number) => void, setStyle: (s: any) => void, setVisible: (v: boolean) => void): string {
    const caretPos = input.selectionStart ?? value.length;
    const justTyped = value.length > prev.length && caretPos >= 2 && value.slice(caretPos - 2, caretPos) === '{{';
    if (justTyped) {
      setIndex(caretPos - 2);
      const rect = input.getBoundingClientRect();
      setStyle({ position: 'fixed', top: rect.bottom + 'px', left: rect.left + 'px', width: '300px' });
      setVisible(true);
    } else {
      setVisible(false);
    }
    return value;
  }

  verifyMessageText(value: string, input: HTMLTextAreaElement) {
    this.previousMessageValue = this._verifyTextInput(value, input, this.previousMessageValue,
      i => this.messageTokenIndex = i,
      s => this.messageDialogStyle = s,
      v => this.messageModalVisible = v);
  }

  verifyDetailsText(value: string, input: HTMLTextAreaElement) {
    this.previousDetailsValue = this._verifyTextInput(value, input, this.previousDetailsValue,
      i => this.messageTokenIndex = i,
      s => this.detailsDialogStyle = s,
      v => this.detailsModalVisible = v);
  }

  private _spliceFormValue(ctrl: string, idx: number, replacement: string) {
    const val: string = this.notificationMessageForm.get(ctrl)?.value ?? '';
    this.notificationMessageForm.get(ctrl)?.setValue(val.slice(0, idx) + replacement + val.slice(idx + 2));
  }

  onClickAddTemplateVariableToMessage(value: string) {
    this._spliceFormValue('message', this.messageTokenIndex, `{{${value}}}`);
  }
  onClickAddTagTemplateVariableToMessage(value: string) {
    this._spliceFormValue('message', this.messageTokenIndex, `{{${value}}}`);
  }
  onClickAddTemplateVariableToDetails(value: string) {
    this._spliceFormValue('details', this.messageTokenIndex, `{{${value}}}`);
  }

  onFilterMetricsChange(event: MultiSelectFilterEvent, metric: MetricFormGroup) {
    const term = event.filter?.trim() ?? '';
    if (term.length > 2) this.filterSubject.next({ term, metric });
  }

  removeCondition(index: number) {
    this.conditionArray.controls.splice(index, 1);
    this.conditionArray.controls.forEach((c, i) => c.get('id')?.setValue((i + 1).toString()));
    this.buildConditionGraphsList();
    this.resetSeverityOptions();
    this.conditionFiltersMap.delete((index + 1).toString());
  }

  resetSeverityOptions() {
    this.severityOptions.forEach(s => s.disabled = true);
    this.conditionArray.controls.forEach(c =>
      this.severityOptions[severityOptions.findIndex(s => s.label === c.get('severity')?.value.label)].disabled = false
    );
  }

  private _swapConditions(a: number, b: number) {
    [this.conditionArray.controls[a], this.conditionArray.controls[b]] = [this.conditionArray.controls[b], this.conditionArray.controls[a]];
    const orderA = this.conditionArray.controls[a].get('order')?.value ?? null;
    const orderB = this.conditionArray.controls[b].get('order')?.value ?? null;
    this.conditionArray.controls[a].get('order')?.setValue(orderB as never);
    this.conditionArray.controls[b].get('order')?.setValue(orderA as never);
    this.conditionArray.controls.forEach((c, i) => c.get('id')?.setValue((i + 1).toString()));
  }

  onClickThresholdArrowDown(index: number) { this._swapConditions(index, index + 1); }
  onClickThresholdArrowUp(index: number) { this._swapConditions(index, index - 1); }

  onChangeConditionFiltersSelection(condition: any, dimension: string, event: MultiSelectChangeEvent) {
    this.conditionFiltersMap.get(condition.get('id')?.value!)!.get(dimension)!.set('selected', event.value);
    this.graphGroupBy.set(dimension, event.value);
    this.requestGraphGroupBy.set(dimension, event.value);
    this.getGraphSeries();

    // Actualiza los valores disponibles del resto de dimensiones según la selección actual,
    // preservando el selected ya establecido arriba.
    // if (this.isSimpleConditionAlert || this.isCompositeConditionAlert) {
    //   this.resetConditionFilters(condition);
    // }

    if (this.isLogsAlert) {
      const selectedDimensions: SelectedDimensionDto[] = [];
      this.groupByForm.get('groupBy')?.value.forEach((dim: string) =>
        this.conditionFiltersMap.get(condition.get('id')?.value!)!.get(dim)?.get('selected')?.forEach((f: string) =>
          selectedDimensions.push(new SelectedDimensionDto(dim, f))
        )
      );
      const filterParameters = this.buildFilterOccurrencesDtos();
      const req = new DistinctValuesRequest(selectedDimensions, filterParameters);
      this.groupByForm.get('groupBy')?.value.forEach((dim: string) => {
        if (dim === dimension) return;
        this.alertOcurrencesService.getDistinctValuesForDimension(this.logsStep1Form.get('catalog')?.value, dim, req).subscribe(
          (response) => {
            const m = this.conditionFiltersMap.get(condition.get('id')?.value!)!.get(dim)!;
            const sel = m.get('selected')!; const crt = m.get('created')!; const lst = m.get('lost')!;
            this.conditionFiltersMap.get(condition.get('id')?.value!)!.set(dim,
              new Map().set('values', response).set('selected', sel).set('created', crt).set('lost', lst)
                .set('merge', [...new Set([...crt, ...lst, ...sel])])
            );
          },
          () => {}
        );
      });
    }
  }

  onClickGoToCreateAlert() { this.router.navigate(['alert/create'], { state: { isThreshold: true } }); }
  onClickGoToMofifyAlert() { this.router.navigate(['alerts']); }

  toSeconds(timeStr: string): number {
    const m = timeStr.match(/^(\d+)([smhd])$/i);
    if (!m) throw new Error('Formato inválido: ' + timeStr);
    const v = parseInt(m[1], 10);
    return ({ s: 1, m: 60, h: 3600, d: 86400 } as any)[m[2].toLowerCase()] * v;
  }

  private _getTime(key: string): string {
    return this.formatTime(this.toSeconds(this.advancedOptionsForm.get('timeWindow')?.value.value) * this.activationRecoverForm.get(key)?.value.value);
  }

  getActivationTime1() { return this._getTime('activation1'); }
  getActivationTime2() { return this._getTime('activation2'); }
  getRecoverTime1()    { return this._getTime('recover1'); }
  getRecoverTime2()    { return this._getTime('recover2'); }

  formatTime(totalSeconds: number): string {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const parts = [
      d && `${d} día${d > 1 ? 's' : ''}`,
      h && `${h} h`, m && `${m} m`, s && `${s} s`
    ].filter(Boolean) as string[];
    if (!parts.length) return '0 s';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} y ${parts[1]}`;
    return parts.slice(0, -1).join(', ') + ' y ' + parts.slice(-1);
  }

  private buildFilterOccurrencesDtos(): any[] {
    return this.logsConditionArray.controls
      .map((lc, i) => {
        const field = lc.get('field')?.value;
        const op = lc.get('comparation')?.value?.value;
        const val = lc.get('value')?.value;
        if (!field || !op || !val) return null;
        return { field, operator: op, value: val, logicalOperator: i > 0 ? lc.get('externalOperation')?.value : null };
      })
      .filter(Boolean);
  }

  private _severitySelected(value: number): boolean {
    return this.conditionArray.controls.some(g => g.get('severity')?.value.value === value);
  }
  disasterSelected() { return this._severitySelected(0); }
  criticalSelected()  { return this._severitySelected(1); }
  majorSelected()     { return this._severitySelected(2); }
  warningSelected()   { return this._severitySelected(3); }

  getEndpointsByType() {
    this.endpointService.getEndpointsByType().subscribe(
      (response: any) => { this.endpointsByTypeMap = response; this.endpointsLoaded.next(true); },
      () => this.endpointsLoaded.next(true)
    );
  }

  onChangeStep3EndpointType() {
    this.endpointFieldValues = this.endpointsByTypeMap[this.endpointForm.get('type')?.value.value] || [];
    this.endpointForm.get('endpoint')?.enable();
    this.endpointForm.get('severities')?.enable();
  }

  onClickAddEndpoint() {
    this.endpointList.push(new Endpoint(null, this.endpointForm.get('type')?.value, this.endpointForm.get('endpoint')?.value, this.endpointForm.get('severities')?.value));
    this.endpointForm.reset();
    this.endpointForm.get('endpoint')?.disable();
    this.endpointForm.get('severities')?.disable();
  }

  onClickDeleteEndpoint(i: number) { this.endpointList.splice(i, 1); }

  getAllTeams() {
    this.permissionList = [];
    this.alertService.getAllTeams().subscribe(
      (response) => {
        this.teamList = response;
        if (this.mode === 'create') {
          const teamIdx = this.teamList.findIndex(t => t.id === this.authService.getTeam());
          this.permissionList.push(new Permission(null, this.teamList[teamIdx], permissionTypeOptions[1]));
          this.teamList[teamIdx].disabled = true;
        }
        this.teamsLoaded.next(true);
      },
      () => this.teamsLoaded.next(true)
    );
  }

  onChangeTeam(event: any) {
    this.teamList[this.teamList.findIndex(t => t.id === event.value.id)].disabled = true;
  }

  loadBaselineIndicators(alertViewDto: AlertViewDto) {
    this.indicatorArray.clear();
    alertViewDto.indicators?.filter(ind => !ind.isBaseline).forEach(indicator => {
      const newIndicator = this._fb.group({
        id: this._fb.control(indicator.id),
        name: this._fb.control(indicator.name),
        metrics: this._fb.array<MetricFormGroup>([]),
        finalExpression: this._fb.control({ value: indicator.finalExpression, disabled: true })
      }) as IndicatorFormGroup;
      indicator.alertMetrics?.forEach((metric, j) => {
        const ml = [new TableMetricInfo(metric.dbName, metric.tableName, metric.metricName, [])];
        newIndicator.controls.metrics.push(this._fb.group({
          metricId: this._fb.control(metric.metricId),
          id: this._fb.control((j + 1).toString()),
          name: this._fb.control(`${this.letters[0]}.${j + 1}`),
          metric: this._fb.control({ value: ml[0], disabled: true }),
          operation: this._fb.control({ value: matOperationOptions.find(o => o.value === metric.operation), disabled: true }),
          options: this._fb.control(ml),
          idInventory: this._fb.control(metric.idInventory)
        }) as MetricFormGroup);
      });
      this.indicatorArray.push(newIndicator);
    });
  }

  async loadBaselines(alertViewDto: AlertViewDto) 
  {
    try 
    {
      this.baselinesListLoading = true;

      this.baselineResponseList = await firstValueFrom(
        this.inventoryBaselinesService.getBaselines(this.isBaselinePastAverageAlert ? 'past_average' : this.isBaselinePastAveragePonderedAlert ? 'past_average_pondered' : 'ksigma')
      );

      this.baselineIndicator = alertViewDto.indicators?.find(indicator => indicator.isBaseline)!;
      this.selectedBaseline = this.baselineResponseList.find(baseline => baseline.name === this.baselineIndicator?.alertMetrics?.at(0)?.metricName!);

      this.getBaselineGroupByOptions();

      this.loadBaselineIndicators(alertViewDto);

      this.resultMetricMap.set(0, this.selectedBaseline.alertIndicatorViewDto.finalExpression);

      this.generateInternalNameAndName();

      this.groupByForm.get('groupBy')?.setValue(alertViewDto.groupBy?.map(dimension => dimension.toLowerCase()));

      this.conditionFiltersMap = new Map();

      alertViewDto.conditions!.forEach((condition, i) => 
      {
        this.conditionFiltersMap.set((i+1).toString(), new Map());
    
        let baselineType: string = this.isBaselinePastAverageAlert || this.isBaselinePastAveragePonderedAlert ? 'CDN' : 'QOE';
        this.inventoryBaselinesService.getDimensionValues(new DimensionValuesRequest(baselineType, this.selectedBaseline.id, this.groupByForm.get('groupBy')?.value!)).subscribe(
          (response) => 
          {
            for (const dimension in response) 
            {
              let selected: string[] = [];
              let created: string[] = [];
              let merge: string[] = [];
              let lost: string[] = [];

              condition.conditionFilters?.filter((conditionFilter) => conditionFilter.externalOperation == null && conditionFilter.filterField == dimension && (conditionFilter.inclusionType === 'INCLUDE' || conditionFilter.inclusionType === 'EXCLUDE')).forEach((cf) => {

                if (cf.isCreated)
                  created.push(cf.filterValue!);
                else
                  selected.push(cf.filterValue!);
              });

              selected = selected.length == 0 && created.length == 0 ? response[dimension] : selected.length == 0 ? created : selected;

              // Perdidos: selected que ya no existen en values (response)
              lost = selected.filter(v => !response[dimension].includes(v));

              // 🔥 Merge con orden: created → lost → values
              merge = [...new Set([...created, ...lost, ...response[dimension]])];

              this.conditionFiltersMap.get((i+1).toString())!.set(dimension, new Map().set('values', response[dimension]).set('selected', selected).set('created', created).set('lost', lost).set('merge', merge));
            }
          },
          () => {

          }
        );
      });
    } 
    catch 
    {
      this.baselinesListError = true;
    } 
    finally 
    {
      this.baselinesListLoading = false;
    }
  }

  async fromDtoToForm(alertViewDto: AlertViewDto) {

  // ===========================
  // SIMPLE / COMPOSITE ALERT
  // ===========================
  if (this.isSimpleConditionAlert || this.isCompositeConditionAlert) {

    this.isInitialMetricListLoading = true;

    const indicators = alertViewDto.indicators ?? [];

    from(indicators).pipe(
      // 1) Crea indicadores y carga métricas (secuencial)
      concatMap((indicator, i) => {

        const newIndicator: IndicatorFormGroup = this._fb.group({
          id: this._fb.control(indicator.id),
          name: this._fb.control(indicator.name),
          metrics: this._fb.array<MetricFormGroup>([]),
          finalExpression: this._fb.control(indicator.finalExpression)
        }) as IndicatorFormGroup;

        this.resultMetricMap.set(i, indicator.finalExpression!);
        this.indicatorArray.push(newIndicator);
        this.indicatorNames.push(this.letters[i]);

        const metrics = indicator.alertMetrics ?? [];

        return from(metrics).pipe(
          concatMap((metric, j) =>
            this.metricService.getMetrics(metric.metricName!).pipe(
              tap((response) => {
                this.indicatorArray.at(i).controls.metrics.push(
                  this._fb.group({
                    metricId: this._fb.control(metric.metricId),
                    id: this._fb.control((j + 1).toString()),
                    name: this._fb.control(this.letters[i] + "." + (j + 1)),
                    metric: this._fb.control(
                      (() => {

                        let returnMetric: any = null;

                        // 0️⃣ Candidatos por metric + table
                        const baseCandidates = response.filter(met =>
                          met.metric === metric.metricName &&
                          met.table_name === metric.tableName
                        );

                        // 🚨 Si no hay ninguno → flag
                        if (!baseCandidates.length) {
                          this.corruptedAlert = true;
                          return null;
                        }

                        if (baseCandidates.length === 1) return baseCandidates[0];

                        // 1️⃣ Match exacto
                        const exact = baseCandidates.find(met =>
                          met.dimension!
                            .slice().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
                            .join(',') === metric.dimensions!.split(',').sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
                            .join(',')
                        );

                        if (exact) returnMetric = exact;

                        if (returnMetric == null || !returnMetric || returnMetric == undefined)
                        {
                          // 2️⃣ Fallback por dimensiones
                          const metricDims = metric.dimensions!.split(',').map(d => d.trim().toLowerCase());

                          const candidates = baseCandidates
                          .map(met => ({
                            met,
                            dims: met.dimension!.map(d => d.toLowerCase())
                          }))
                          .filter(x =>
                            metricDims.every(d => x.dims.includes(d))
                          )
                          .sort((a, b) =>
                            a.dims.length - b.dims.length
                          );

                          returnMetric = candidates.length ? candidates[0].met : null;
                        }

                        return returnMetric;
                      })()
                    ),
                    operation: this._fb.control(matOperationOptions.find(opt => opt.value == metric.operation)),
                    options: this._fb.control(response),
                    idInventory: this._fb.control(metric.idInventory!)
                  }) as MetricFormGroup
                );
              })
            )
          )
        );
      }),

      // 2) Cuando termina indicadores+métricas, ya podemos pintar la alerta
      finalize(() => {
        this.isInitialMetricListLoading = false;
      })

    ).subscribe({
      complete: () => {
        // ✅ Esto ya se ejecuta cuando indicadores+métricas han terminado
        this.onChangeMetricSelect();

        this.groupByForm.get('groupBy')?.setValue(alertViewDto.groupBy?.map(dimension => dimension.toLowerCase()));
        this.groupByForm.get('groupBy')?.value.forEach((dimension: string) => {
          this.generateGraphAgroupations(dimension);
        });

        // Prepara map
        this.conditionFiltersMap = new Map();

        // ✅ Ahora: cargar getDimensionValues EN BACKGROUND (sin bloquear render)
        //  - DEDUPE: evitamos pedir la misma combinación mil veces
        //  - CONCURRENCIA: limitamos requests simultáneas para evitar cancelaciones/saturación
        const uniqueCalls = new Map<string, { db: string; table: string; metricName: string; dimension: string }>();

        alertViewDto.groupBy!.forEach((dimension: string) => {
          indicators.forEach(ind => {
            (ind.alertMetrics ?? []).forEach(m => {
              const key = `${m.dbName}|${m.tableName}|${m.metricName}|${dimension}`;
              if (!uniqueCalls.has(key)) {
                uniqueCalls.set(key, {
                  db: m.dbName!,
                  table: m.tableName!,
                  metricName: m.metricName!,
                  dimension
                });
              }
            });
          });
        });

        // Inicializa estructura por condición
        alertViewDto.conditions!.forEach((condition, i) => {
          const condKey = (i + 1).toString();
          this.conditionFiltersMap.set(condKey, new Map());
        });

        from(Array.from(uniqueCalls.values())).pipe(
          // ✅ límite de concurrencia (ajusta a 4/6/8 según tu backend)
          mergeMap((req) =>
            this.alertService.getDimensionValues(req.db, req.table, req.metricName, req.dimension).pipe(
              tap((response) => {

                // Para cada condición, aplica tu misma lógica de selected/created/intersection
                alertViewDto.conditions!.forEach((condition, condIndex) => {
                  const condKey = (condIndex + 1).toString();

                  let selected: string[] = [];
                  let created: string[] = [];
                  let merge: string[] = [];
                  let lost: string[] = [];

                  condition.conditionFilters
                    ?.filter((cf) => cf.externalOperation == null && cf.filterField == req.dimension && (cf.inclusionType === 'INCLUDE' || cf.inclusionType === 'EXCLUDE'))
                    .forEach((cf) => {
                      if (cf.isCreated) created.push(cf.filterValue!);
                      else selected.push(cf.filterValue!);
                    });

                  selected =
                    selected.length === 0 && created.length === 0 ? response
                      : selected.length > 0 && created.length > 0 ? created.concat(selected)
                        : selected.length === 0 ? created
                          : selected;

                  // Detectamos los selected que ya no existen en values (response)
                  lost = selected.filter(v => !response.includes(v));

                  // El merge ahora incluye: values + created + lost
                  merge = [...new Set([...created, ...lost, ...response])];

                  const condMap = this.conditionFiltersMap.get(condKey)!;

                  if (condMap.has(req.dimension.toLowerCase())) {
                    const prevValues = condMap.get(req.dimension.toLowerCase())!.get('values') as string[];
                    const intersection = prevValues.filter(v => response.includes(v));
                    condMap.get(req.dimension.toLowerCase())!.set('values', intersection);

                    condMap.get(req.dimension.toLowerCase())!.set('selected', selected);
                    condMap.get(req.dimension.toLowerCase())!.set('created', created);
                    condMap.get(req.dimension.toLowerCase())!.set('lost', lost);     // 👈 guardamos lost
                    condMap.get(req.dimension.toLowerCase())!.set('merge', merge);   // 👈 merge actualizado
                  } else {
                    condMap.set(
                      req.dimension.toLowerCase(),
                      new Map()
                        .set('values', response)
                        .set('selected', selected)
                        .set('created', created)
                        .set('lost', lost)       // 👈 nuevo campo
                        .set('merge', merge)     // 👈 actualizado
                    );
                  }
                });
              }),
              catchError(() => of(null))
            ),
            6 // <-- CONCURRENCIA
          ),
          finalize(() => {
            // ✅ Cuando ya terminaron TODOS los getDimensionValues (sin bloquear UI)
            // Si necesitas refrescar algo del UI al final, aquí.
            this.getGraphSeries();
          })
        ).subscribe();

        this.generateInternalNameAndName();
      }
    });
  }

  // ===========================
  // LOGS ALERT (lo dejo igual que tu original salvo el getGraphSeries al final real)
  // ===========================
  else if (this.isLogsAlert) {

    this.logsStep1Form.get('service')?.setValue(alertViewDto.logsService);
    this.getDistinctTableNamesByDataType(alertViewDto.logsService!, false);
    this.logsStep1Form.get('catalog')?.setValue(alertViewDto.logsCatalog);

    this.catalogLoaded.pipe(filter((loaded) => loaded === true), take(1)).subscribe(() => {
      this.logsStep1Form.get('catalog')?.setValue(alertViewDto.logsCatalog);
      this.getDistinctMetricsByDataTypeAndTable(alertViewDto.logsService!, alertViewDto.logsCatalog!)
    });

    this.metricsLoaded.pipe(filter((loaded) => loaded === true), take(1)).subscribe(() => {
      alertViewDto.conditions?.at(0)?.conditionFilters?.filter(conditionFilter => conditionFilter.externalOperation != null).forEach((conditionFilter) => {
        const group: LogConditionFormGroup = this._fb.group({
          logConditionId: this._fb.control(conditionFilter.conditionFilterId),
          externalOperation: this._fb.control(conditionFilter.externalOperation),
          field: this._fb.control({ value: conditionFilter.filterField, disabled: false }, [Validators.required]),
          comparation: this._fb.control(advancedSearchOptions.find((compOperation) => compOperation.value == conditionFilter.compOperation)),
          value: this._fb.control(conditionFilter.filterValue),
          dimensions: this._fb.control([] as string[])
        }) as LogConditionFormGroup;

        this.logsConditionArray.push(group);
      });

      this.logsConditionArray.controls.forEach((logCondition, i) => {
        this.getDistinctDimensionsByDataTypeTableAndMetric(alertViewDto.logsService!, alertViewDto.logsCatalog!, i);
      });

      this.groupByForm.get('groupBy')?.setValue(alertViewDto.groupBy?.map(dimension => dimension.toLowerCase()));

      this.conditionFiltersMap = new Map();

      alertViewDto.conditions!.forEach((condition, i) => {
        this.conditionFiltersMap.set((i + 1).toString(), new Map());
        let filterDimensionMap: Map<string, Map<string, string[]>> = new Map();

        alertViewDto.groupBy!.forEach((dimension) => {
          this.alertOcurrencesService.getDistinctValuesForDimension(alertViewDto.logsCatalog!, dimension, null).subscribe(
            (response) => {
              let selected: string[] = [];
              let created: string[] = [];
              let merge: string[] = [];
              let lost: string[] = []; // 👈 nueva lista

              condition.conditionFilters?.filter((conditionFilter) => conditionFilter.externalOperation == null && conditionFilter.filterField == dimension && (conditionFilter.inclusionType === 'INCLUDE' || conditionFilter.inclusionType === 'EXCLUDE')).forEach((cf) => {
                if (cf.isCreated) created.push(cf.filterValue!);
                else selected.push(cf.filterValue!);
              });

              selected = selected.length == 0 && created.length == 0 ? response : selected.length == 0 ? created : selected;

              // 👉 Detectamos los selected que ya no existen en values (response)
              lost = selected.filter(v => !response.includes(v));

              // 👉 El merge ahora incluye: values + created + lost
              merge = [...new Set([...created, ...lost, ...response])];

              filterDimensionMap.set(dimension.toLowerCase(), new Map().set('values', response).set('selected', selected).set('created', created).set('merge', merge).set('lost', lost));
              this.conditionFiltersMap.set((i + 1).toString(), filterDimensionMap);
            },
            () => { }
          );
        });
      });

      this.generateInternalNameAndName();
    });
  }

  // ===========================
  // BASELINE ALERT
  // ===========================
  else if (this.isBaselineAlert) {
    this.baselineSelectDisabled = true;

    alertViewDto.baselineType == 'PAST_AVERAGE'
      ? this.isBaselinePastAverageAlert = true
      : alertViewDto.baselineType == 'PAST_AVERAGE_PONDERED'
        ? this.isBaselinePastAveragePonderedAlert = true
        : this.isBaselineKSigmaAlert = true;

    this.loadBaselines(alertViewDto);
    this.indicatorNames.push(this.letters[0]);
  }

  // ===========================
  // ADVANCED OPTIONS
  // ===========================
  this.advancedOptionsForm.get('timeWindow')
    ?.setValue(timeWindowOptions.find((two) => two.label.startsWith(alertViewDto.evaluationPeriod!.replace(/(\d+)([a-zA-Z]+)/, "$1 $2"))));
  this.advancedOptionsForm.get('discardTime')
    ?.setValue(discardTimeOptions.find((dto) => dto.value == alertViewDto.offset));
  this.advancedOptionsForm.get('periodicity')
    ?.setValue(periodicityOptions.find((po) => po.label.startsWith(alertViewDto.evaluationFrequency!.replace(/(\d+)([a-zA-Z]+)/, "$1 $2"))));

  // ===========================
  // CONDITIONS
  // ===========================
  alertViewDto.conditions?.forEach((condition, i) => {

    const newCondition: ConditionFormGroup = this._fb.group({
      conditionId: this._fb.control(condition.id),
      id: this._fb.control((this.conditionArray.length + 1).toString()),
      severity: this._fb.control(this.severityOptions.find((opt) => opt.value == condition.severity)),
      status: this._fb.control(condition.status),
      clauses: this._fb.array<ClauseFormGroup>([]),
      baselineVariables: this._fb.group({
        baselinesVariablesId: [condition.baselinesVariables?.id],
        type: [this.isBaselinePastAverageAlert && condition.baselinesVariables?.auxVar1 && condition.baselinesVariables?.auxVar2 ? this.baselinesVariablesConditionTypes[2]
          : this.isBaselinePastAverageAlert && condition.baselinesVariables?.auxVar1 ? this.baselinesVariablesConditionTypes[1]
            : this.isBaselinePastAverageAlert && condition.baselinesVariables?.auxVar2 ? this.baselinesVariablesConditionTypes[0]
              : this.baselinesVariablesConditionTypes[0]],
       
        auxVar1: [condition.baselinesVariables?.auxVar1],
        auxVar2: [condition.baselinesVariables?.auxVar2],
        auxVar3: [condition.baselinesVariables?.auxVar3]
      })
    }) as ConditionFormGroup;

    this.conditionArray.push(newCondition);

    if (!this.isBaselineAlert || (this.isBaselineAlert && condition.alertClauses?.length! > 1)) {
      condition.alertClauses?.forEach((clause) => {
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
      });
    }

    this.resetSeverityOptions();
    this.conditionTextMap.set(i, this.generateConditionText(i));

    this.conditionFiltersInclusionTypeMap.set((i+1).toString(), new Map());

    condition.conditionFilters!
      .filter((conditionFilter) => conditionFilter.inclusionType === 'INCLUDE' || conditionFilter.inclusionType === 'EXCLUDE')
      .forEach((conditionFilter) => {
      if (!this.conditionFiltersInclusionTypeMap.get((i+1).toString())?.has(conditionFilter.filterField!))
        this.conditionFiltersInclusionTypeMap.get((i+1).toString())?.set(conditionFilter.filterField!, dimensionValuesInclusionOptions.find((opt) => opt.value == conditionFilter.inclusionType!));
    });

    // Add any groupBy dimension not present in conditionFilters with default INCLUDE
    alertViewDto.groupBy?.forEach((dimension) => {
      const key = dimension.toLowerCase();
      if (!this.conditionFiltersInclusionTypeMap.get((i+1).toString())?.has(key))
        this.conditionFiltersInclusionTypeMap.get((i+1).toString())?.set(key, dimensionValuesInclusionOptions[0]);
    });

    // Cargar filtros CONTAINS / NOT_CONTAINS en dimensionContainsFilterMap
    const condId = (i + 1).toString();
    if (!this.dimensionContainsFilterMap.has(condId)) {
      this.dimensionContainsFilterMap.set(condId, new Map());
    }
    condition.conditionFilters!
      .filter(cf => cf.inclusionType === 'CONTAINS' || cf.inclusionType === 'NOT_CONTAINS')
      .forEach(cf => {
        const dim = cf.filterField!;
        // Si ya hay una entrada la sobreescribimos (en principio solo debería haber una por dimensión)
        this.dimensionContainsFilterMap.get(condId)!.set(dim, {
          type: cf.inclusionType!,
          value: cf.filterValue ?? '',
          externalOperation: cf.externalOperation ?? 'AND'
        });
        // Expandir el panel para que se vea el valor cargado
        if (!this.dimensionFilterExpandedMap.has(condId)) {
          this.dimensionFilterExpandedMap.set(condId, new Map());
        }
        this.dimensionFilterExpandedMap.get(condId)!.set(dim, true);
      });

  });

  // ===========================
  // ACTIVATION AND RECOVERY
  // ===========================
  this.activationRecoverForm.get('activation1')?.setValue(this.activationRecoverEvaluationOptions.find((opt) => opt.value == alertViewDto.alarmNumPeriods));
  this.activationRecoverForm.get('activation2')?.setValue(this.activationRecoverEvaluationOptions.find((opt) => opt.value == alertViewDto.alarmTotalPeriods));
  this.activationRecoverForm.get('recover1')?.setValue(this.activationRecoverEvaluationOptions.find((opt) => opt.value == alertViewDto.recoveryNumPeriods));
  this.activationRecoverForm.get('recover2')?.setValue(this.activationRecoverEvaluationOptions.find((opt) => opt.value == alertViewDto.recoveryTotalPeriods));

  // ===========================
  // SILENCE PERIODS
  // ===========================
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

  // ===========================
  // ENDPOINTS + TAGS + NOTIFICATIONS + PERMISSIONS
  // Esperamos a que endpointsByTypeMap y teamList estén cargados
  // para evitar race conditions.
  // ===========================
  forkJoin([
    this.endpointsLoaded.pipe(filter(v => v === true), take(1)),
    this.teamsLoaded.pipe(filter(v => v === true), take(1))
  ]).subscribe(() => {

    // ===========================
    // ENDPOINTS
    // ===========================
    (alertViewDto.endpoints ?? []).forEach((endpoint) => {
      if (!this.endpointsByTypeMap || !this.endpointsByTypeMap[endpoint.type]) return;

      this.endpointsByTypeMap[endpoint.type].forEach((ept: any) => {
        if (ept.id == endpoint.endpointId) {
          let severityList: any[] = [];

          (endpoint.severities ?? []).forEach((svrt) => {
            const found = this.severityOptions.find((opt) => opt.value == svrt);
            if (found) severityList.push(found);
          });

          this.endpointList.push(new Endpoint(endpoint.id!, this.endpointTypeOptions.find((opt) => opt.value == endpoint.type), ept, severityList));
        }
      });
    });

    // ===========================
    // ALERT TAGS
    // ===========================
    (alertViewDto.alertTags ?? []).forEach((tag) => {
      this.tagList.push(new Tag(tag.name!, tag.value!, 'METRIC'));
    });

    // ===========================
    // NOTIFICATIONS
    // ===========================
    this.notificationMessageForm.get('message')?.setValue(alertViewDto.alertText ?? '');
    this.notificationMessageForm.get('details')?.setValue(alertViewDto.alertDetail ?? '');
    this.notificationMessageForm.get('opiUrl')?.setValue(alertViewDto.opiUrl ?? '');

    // ===========================
    // PERMISSIONS
    // ===========================
    (alertViewDto.permissions ?? []).forEach((permission) => {
      const team = this.teamList.find((t) => t.id == permission.teamId);
      if (!team) return; // protección contra team no encontrado

      this.permissionList.push(
        new Permission(
          permission.id,
          team,
          this.permissionTypeOptions.find((permissionType) =>
            permission.writePermission ? permissionType.value == 'rw' : permissionType.value == 'r'
          )
        )
      );

      const teamIndex = this.teamList.findIndex(t => t.id == permission.teamId);
      if (teamIndex !== -1) {
        this.teamList[teamIndex].disabled = true;
      }
    });

    if (this.isLogsAlert) {
      this.generateInternalNameAndName();
    }
  });
}

  onClickConfirmCrupdateAlert() 
  {
    this.isLoading = true;
    this.isSuccess = false;
    this.dbError = false;
    this.dolphinError = false;

    // PERMISSIONS
    let alertPermissions: AlertPermissionDto[] = [];

    for (let permission of this.permissionList)
    {
      alertPermissions.push(new AlertPermissionDto(permission.id, permission.type.value.includes('rw') ? true : false, permission.team.id));
    }

    // CONDITION HISTORIES
    let alertConditionHistories: AlertConditionHistoryDto[] = [];

    // ENDPOINTS
    let endpointAlerts: EndpointAlertDto[] = [];

    for (let endpoint of this.endpointList) 
    {
      let endpointAlert: EndpointAlertDto = new EndpointAlertDto(endpoint.id, endpoint.severities.map(severity => severity.value), endpoint.endpoint.id);
      endpointAlerts.push(endpointAlert);
    }

    // PERIODOS DE SILENCIO
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

    // INDICATORS
    let alertIndicators: AlertIndicatorDto[] = [];

    for (let i = 0; i < this.indicatorArray.length; i++)
    {
      // METRICS
      let alertMetrics: AlertMetricDto[] = [];

      for (let metric of this.indicatorArray.at(i).controls.metrics.controls) 
      {
        if (metric.get('metric')?.value != null)
        {
          alertMetrics.push(new AlertMetricDto(metric.get('metricId')?.value!, metric.get('metric')?.value!.bbdd!, metric.get('metric')?.value!.table_name!, metric.get('metric')?.value!.metric!, metric.get('operation')?.value!.value!, metric.get('metric')?.value!.dimension?.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })).join(',')!, null));
        }
      }

      alertIndicators.push(new AlertIndicatorDto(this.indicatorArray.at(i).get('id')?.value!, this.indicatorArray.at(i).get('name')?.value!, alertMetrics, this.resultMetricMap.get(i)!, false));
    }

    // CONDITIONS
    let alertConditions: AlertConditionDto[] = [];

    for (let condition of this.conditionArray.controls) {
      let conditionFiltersDimensionsMap: Map<string, Map<string, string[]>> = this.conditionFiltersMap.get(condition.get('id')?.value!)!;
      let conditionFiltersList: ConditionFilterDto[] = [];
      let alertClauses: AlertClauseDto[] = [];

      // CLAUSES
      for (let clause of condition.controls.clauses.controls) {
        alertClauses.push(new AlertClauseDto(clause.get('clauseId')?.value!, clause.get('indicatorName')?.value!, clause.get('startBrackets')?.value!, clause.get('comparation')?.value.value, clause.get('comparation')?.value.value == "MORE_THAN" || clause.get('comparation')?.value.value == "LESS_THAN" || clause.get('comparation')?.value.value == "EQUALS" || clause.get('comparation')?.value.value == "NOT_EQUALS" ? clause.get('value')?.value! : clause.get('min')?.value!, clause.get('endBrackets')?.value!, clause.get('order')?.value!, clause.get('externalOperation')?.value!, clause.get('minIncluded')?.value!, clause.get('max')?.value!, clause.get('maxIncluded')?.value!));
      }

      // CONDITION FILTERS
      conditionFiltersDimensionsMap.forEach((filterMap, dimension) => {
        let selected: string[] = filterMap.get('selected') || [];
        let created: string[]  = filterMap.get('created')  || [];
        let merge: string[]    = filterMap.get('merge')    || [];

        let createdSet = new Set(created);
        let selectedSet = new Set(selected);

        // Opciones “de la lista” = todas menos las creadas
        let nonCreated = merge.filter(v => !createdSet.has(v));

        // ¿Están TODOS los “de la lista” seleccionados?
        let allNonCreatedSelected =
          nonCreated.length > 0 &&
          nonCreated.every(v => selectedSet.has(v));

        // 1) Enviar creados a mano que estén seleccionados (siempre)
        for (let filter of created) {
          if (selectedSet.has(filter)) {
            conditionFiltersList.push(new ConditionFilterDto(null, null, "EQUALS", dimension, filter, true, this.conditionFiltersInclusionTypeMap.get(condition.get('id')?.value!)!.get(dimension)!.value));
          }
        }

        // 2) Enviar los "de la lista" seleccionados SOLO si NO se seleccionaron todos
        if (!allNonCreatedSelected) {
          for (let filter of nonCreated) {
            if (selectedSet.has(filter)) {
              conditionFiltersList.push(new ConditionFilterDto(null, null, "EQUALS", dimension, filter, false, this.conditionFiltersInclusionTypeMap.get(condition.get('id')?.value!)!.get(dimension)!.value));
            }
          }
        }

        // 3) Enviar filtro CONTAINS/NOT_CONTAINS si el input de texto está relleno
        const containsEntry = this.dimensionContainsFilterMap.get(condition.get('id')?.value!)?.get(dimension);
        if (containsEntry?.value?.trim()) {
          conditionFiltersList.push(new ConditionFilterDto(null, containsEntry.externalOperation, "EQUALS", dimension, containsEntry.value.trim(), false, containsEntry.type));
        }
      });

      if (this.isLogsAlert)
      {
        this.logsConditionArray.controls.forEach((logCondition) => {
          conditionFiltersList.push(new ConditionFilterDto(null, logCondition.get('externalOperation')?.value!, logCondition.get('comparation')?.value!.value!, logCondition.get('field')?.value!, logCondition.get('value')?.value!, false, this.conditionFiltersInclusionTypeMap.get(condition.get('id')?.value!)!.get('dimension')!.value));
        });
      }

      let baselinesVariablesDto: BaselinesVariablesDto | null = null;

      if (this.isBaselineAlert)
      {
        baselinesVariablesDto = new BaselinesVariablesDto(
          (condition.get('baselineVariables') as FormGroup).get('baselinesVariablesId')?.value,
          (condition.get('baselineVariables') as FormGroup).get('auxVar1')?.value,
          (condition.get('baselineVariables') as FormGroup).get('auxVar2')?.value,
          (condition.get('baselineVariables') as FormGroup).get('auxVar3')?.value
        );

        if (this.mode == 'create')
          alertClauses.push(new AlertClauseDto(null, 'B', null, 'MORE_THAN', null, null, 0, null, null, null, null));
      }

      alertConditions.push(new AlertConditionDto(condition.get('conditionId')?.value!, condition.get('severity')?.value.value, condition.get('status')?.value!, baselinesVariablesDto, alertClauses, conditionFiltersList));
    }

    // BASELINE
    if (this.isBaselineAlert && this.mode == 'create')
    {
      let alertMetricDto: AlertMetricDto = new AlertMetricDto(null, 'BASELINES', this.isBaselinePastAverageAlert || this.isBaselinePastAveragePonderedAlert ? 'baseline_cdn' : 'baseline_qoe', this.selectedBaseline.name, 'SUM', '', this.selectedBaseline.idInventory);
      alertIndicators.push(new AlertIndicatorDto(null, 'B', [alertMetricDto], "B.1", this.isBaselineAlert));
    }
    else if (this.isBaselineAlert && this.mode == 'edit')
    {
      if (this.baselineIndicator)
      {
        let alertMetrics: AlertMetricDto[] = [];

        this.baselineIndicator.alertMetrics?.forEach((metric) => {
          alertMetrics.push(new AlertMetricDto(metric.metricId!, 'BASELINES', this.isBaselinePastAverageAlert || this.isBaselinePastAveragePonderedAlert ? 'baseline_cdn' : 'baseline_qoe', this.selectedBaseline.name, 'SUM', '', this.selectedBaseline.idInventory));
        });

        alertIndicators.push(new AlertIndicatorDto(this.baselineIndicator.id!, 'B', alertMetrics, "B.1", this.isBaselineAlert));
      }
    }

    // ALERTA
    let alertDto: AlertDto = new AlertDto(
      this.internalName,
      this.name,
      this.notificationMessageForm.get('message')?.value,
      this.notificationMessageForm.get('details')?.value,
      this.tagList,
      this.advancedOptionsForm.get('periodicity')?.value.value,
      this.advancedOptionsForm.get('timeWindow')?.value.value,
      this.isSimpleConditionAlert ? 0 : this.isCompositeConditionAlert ? 1 : this.isLogsAlert ? 2 : 3,
      this.advancedOptionsForm.get('discardTime')?.value.value,
      this.groupByForm.get('groupBy')?.value,
      this.notificationMessageForm.get('opiUrl')?.value,
      this.activationRecoverForm.get('activation1')?.value.value,
      this.activationRecoverForm.get('activation2')?.value.value,
      this.activationRecoverForm.get('recover1')?.value.value,
      this.activationRecoverForm.get('recover2')?.value.value,
      this.logsStep1Form.get('service')?.value ? this.logsStep1Form.get('service')?.value : null,
      this.logsStep1Form.get('catalog')?.value ? this.logsStep1Form.get('catalog')?.value : null,
      this.isBaselinePastAverageAlert ? 'PAST_AVERAGE' : this.isBaselinePastAveragePonderedAlert ? 'PAST_AVERAGE_PONDERED' : this.isBaselineKSigmaAlert ? 'K-SIGMA' : null
    );

    alertDto.alertConditions = alertConditions;
    alertDto.alertSilences = alertSilences;
    alertDto.endpointAlerts = endpointAlerts;
    alertDto.alertIndicators = alertIndicators;
    alertDto.alertPermissions = alertPermissions;
    alertDto.alertConditionHistories = alertConditionHistories;

    this.alertService.crupdateAlert(this.mode == 'create' ? null : this.alertId, alertDto).subscribe(
      (response) => 
      {
        if (!response.dbSuccess)
        {
          this.dbError = true;
        }

        if (!response.dolphinSuccess)
        {
          this.dolphinError = true;
        }

        if (response.dbSuccess && response.dolphinSuccess)
          this.isSuccess = true;

        this.isLoading = false;
      },
      (error) =>
      {
        this.isLoading = false;
        this.dbError = true;
        this.dolphinError = true;
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

  allFinalExpressionsCorrect(): boolean 
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

      if (finalCtrl.invalid || this.resultMetricEditionMap.get(index)) {
        allValid = false;
      }
    });

    return allValid;
  }

  getDistinctDataTypes()
  {
    this.dataTypesLoading = true;
    this.dataTypesError = false;

    this.alertOcurrencesService.getDistinctDataTypes().subscribe(
      (response) => {
        this.dataTypesList = response;
        this.dataTypesLoading = false;
        this.dataTypesError = false;

        this.logsStep1Form.get('catalog')?.setValue('');

        this.logsDimensionsIntersectionOptions = [];
      },
      (error) => {
        this.dataTypesLoading = false;
        this.dataTypesError = true;
      }
    )
  }

  getDistinctTableNamesByDataType(dataType: string, resetLogCondition: boolean)
  {
    this.tableNamesByDataTypeLoading = true;
    this.tableNamesByDataTypeError = false;

    this.alertOcurrencesService.getDistinctTableNamesByDataType(dataType).subscribe(
      (response) => {
        this.tableNamesByDataTypeList = response;
        this.catalogLoaded.next(true);
        this.tableNamesByDataTypeLoading = false;
        this.tableNamesByDataTypeError = false;

        this.logsStep1Form.get('catalog')?.enable();

        // If service is modyfied, log conditions are reset
        if (resetLogCondition)
        {
          this.logsConditionArray = this._fb.array<LogConditionFormGroup>([]);
          this.createLogCondition();
        }

        this.logsDimensionsIntersectionOptions = [];

        this.logsStep1Form.get('catalog')?.updateValueAndValidity();
      },
      (error) => {
        this.tableNamesByDataTypeLoading = false;
        this.tableNamesByDataTypeError = true;
      }
    );
  }

  getDistinctMetricsByDataTypeAndTable(dataType: string, tableName: string)
  {
    this.metricsByDataTypeAndTableLoading = true;
    this.metricsByDataTypeAndTableError = false;

    this.alertOcurrencesService.getDistinctMetricsByDataTypeAndTable(dataType, tableName).subscribe(
      (response) => {
        this.metricsByDataTypeAndTableList = response;
        this.metricsLoaded.next(true);
        this.metricsByDataTypeAndTableLoading = false;
        this.metricsByDataTypeAndTableError = false;

        this.logsConditionArray.controls.forEach((group) => {
          group.get('field')?.enable();
        });
      },
      (error) => {
        this.metricsByDataTypeAndTableLoading = false;
        this.metricsByDataTypeAndTableError = true;
      }
    );
  }

  getDistinctDimensionsByDataTypeTableAndMetric(dataType: string, tableName: string, logConditionIndex: number)
  {
    this.dimensionsByDataTypeTableAndMetricLoading = true;
    this.dimensionsByDataTypeTableAndMetricError = false;

    this.alertOcurrencesService.getDistinctDimensionsByDataTypeTableAndMetric(dataType, tableName).subscribe(
      (response) => {
        this.dimensionsByDataTypeTableAndMetricList = response;
        this.dimensionsByDataTypeTableAndMetricLoading = false;
        this.dimensionsByDataTypeTableAndMetricError = false;

        this.logsConditionArray.at(logConditionIndex)!.get('dimensions')?.setValue(response);

        this.getLogsDimensionsIntersection();
      },
      (error) => {
        this.dimensionsByDataTypeTableAndMetricLoading = false;
        this.dimensionsByDataTypeTableAndMetricError = true;
      }
    );
  }

  getLogsDimensionsIntersection() {
    this.logsConditionArray.controls.forEach((group, ind) => {
      const dims = group.get('dimensions')?.value;
      const arr = Array.isArray(dims) ? dims : [];

      if (ind === 0) this.logsDimensionsIntersectionOptions = [...arr];
      else this.logsDimensionsIntersectionOptions =
        this.logsDimensionsIntersectionOptions.filter(item => arr.includes(item));
    });
  }

  countMetrics()
  {
    let count = 0;

    this.indicatorArray.controls.forEach((indicator) => {
      indicator.get('metrics')?.value.forEach((metric: any) => {
        if (metric.metric != null && metric.metric.metric != null)
          count++;
      });
    });

    return count;
  }

  buildConditionGraphsList()
  {
    this.conditionGraphList = [];

    this.conditionArray.controls.forEach((condition, i) => {
      condition.get('clauses')?.value.forEach((clause: any, j) => {

        if (clause.value)
        {
          switch (clause.comparation.value) {
            case 'MORE_THAN':
              this.conditionGraphList.push({type: 'line', label: `Clause ${i + 1}_${j + 1}`, y: clause.value, color: 'red'});
            break;

            case 'LESS_THAN':
              this.conditionGraphList.push({type: 'line', label: `Clause ${i + 1}_${j + 1}`, y: clause.value, color: 'red'});
            break;

            case 'EQUALS':
              this.conditionGraphList.push({type: 'line', label: `Clause ${i + 1}_${j + 1}`, y: clause.value, color: 'red'});
            break;

            case 'NOT_EQUALS':
              this.conditionGraphList.push({type: 'line', label: `Clause ${i + 1}_${j + 1}`, y: clause.value, color: 'red'});
            break;

            case 'WITHIN_RANGE':
              
            break;

            case 'OUT_OF_RANGE':
            break;
          }
        }
      });
    });
  }

  // resetConditionFilters(condition: ConditionFormGroup)
  // {
  //   this.conditionFiltersMap.set(condition.get('id')?.value!, new Map());
  //   this.groupByForm.get('groupBy')?.value.forEach((dimension: string) => {
  //     this.indicatorArray.controls.forEach(indicator => {
  //       indicator.controls.metrics.controls.forEach(metric => {
  //         const metricField = metric.get('metric')?.value;
  //         if (metricField) {
  //           this.alertService.getDimensionValues(metricField.bbdd!, metricField.table_name!, metricField.metric!, dimension).subscribe(
  //             (response) => {
  //               if (this.conditionFiltersMap.get(condition.get('id')?.value!)?.has(dimension))
  //               {
  //                 let dimensionValuesIntersection: string[] = this.conditionFiltersMap.get(condition.get('id')?.value!)?.get(dimension)!.get('values')!.filter((value) => response.includes(value))!;
  //                 this.conditionFiltersMap.get(condition.get('id')?.value!)?.get(dimension)!.set('values', dimensionValuesIntersection).set('merge', dimensionValuesIntersection);
  //               }
  //               else
  //               {
  //                 this.conditionFiltersMap.get(condition.get('id')?.value!)?.set(dimension, new Map().set('values', response).set('selected', response).set('created', []).set('merge', response))
  //               }
  //             },
  //             (error) => {
  //               if (!this.conditionFiltersMap.get(condition.get('id')?.value!)?.has(dimension))
  //               {
  //                 this.conditionFiltersMap.get(condition.get('id')?.value!)?.set(dimension, new Map().set('values', []).set('selected', []).set('created', []).set('merge', []))
  //               }
  //             }
  //           )
  //         }
  //      });
  //     });
  //   });
  // }

  resetConditionFilters(condition: ConditionFormGroup) {
    const condId = condition.get('id')?.value!;

    // Se inicializa conditionFiltersInclusionTypeMap
    if (!this.conditionFiltersInclusionTypeMap.has(condId)) {
      this.conditionFiltersInclusionTypeMap.set(condId, new Map());
    }

    // Se inicializa conditionFiltersMap
    if (!this.conditionFiltersMap.has(condId)) {
      this.conditionFiltersMap.set(condId, new Map());
    }

    // Se inicializa la request para obtener los dimension values
    const metrics: DimensionValuesMetricRequest[] = [];
    this.indicatorArray.controls.forEach(indicator =>
      indicator.controls.metrics.controls.forEach(metric => {
        const f = metric.get('metric')?.value;
        if (f) metrics.push(new DimensionValuesMetricRequest(f.bbdd!, f.table_name!, f.metric!));
      })
    );

    if (!metrics.length) return;

    const condMap = this.conditionFiltersMap.get(condId)!;
    const dimensions: DimensionValuesAgroupationRequest[] = (this.groupByForm.get('groupBy')?.value as string[])
      .map(dim => new DimensionValuesAgroupationRequest(dim, condMap.get(dim)?.get('selected') ?? []));

    if (!dimensions.length) return;

    const request = new AlertDimensionValuesRequest(metrics, dimensions);

    this.allDimensionValuesLoading = true;
    this.allDimensionValuesError = false;

    this.alertService.getAllDimensionValues(request).subscribe(
      (response: DimensionValuesResponse[]) => {

        this.allDimensionValuesLoading = false;
        this.allDimensionValuesError = false;

        dimensions.forEach(({ dimension }) => {

          this.conditionFiltersInclusionTypeMap.get(condId)?.set(dimension, this.conditionFiltersInclusionTypeMap.get(condId)?.has(dimension) ? this.conditionFiltersInclusionTypeMap.get(condId)?.get(dimension) : this.dimensionValuesInclusionOptions[0]);

          const newValues: string[] = response.find(r => r.dimension === dimension)?.values ?? [];

          if (!condMap.has(dimension))
          {
            condMap.set(dimension, new Map()
              .set('values', newValues)
              .set('selected', newValues)
              .set('created', [])
              .set('lost', [])
              .set('merge', newValues));
          }
        });
      },
      () => {
        this.allDimensionValuesLoading = false;
        this.allDimensionValuesError = true;
        dimensions.forEach(({ dimension }) => {
          if (!condMap.has(dimension))
            condMap.set(dimension, new Map().set('values', []).set('selected', []).set('created', []).set('lost', []).set('merge', []));
        });
      }
    );
  }

  resetLogsConditionFilters(condition: ConditionFormGroup)
  {
    this.conditionFiltersMap.set(condition.get('id')?.value!, new Map());
    this.groupByForm.get('groupBy')?.value.forEach((dimension: string) => {
      const filterParameters = this.buildFilterOccurrencesDtos();
      const distinctValuesRequest = new DistinctValuesRequest(
        null, 
        filterParameters 
      );
      this.alertOcurrencesService.getDistinctValuesForDimension(this.logsStep1Form.get('catalog')?.value, dimension, distinctValuesRequest).subscribe(
        (response) => {
          this.conditionFiltersMap.get(condition.get('id')?.value!)!.set(dimension, new Map().set('values', response).set('selected', response).set('created', []).set('merge', response));
          this.getLogsDimensionsIntersection();
        },
        (error) => {

        }
      )
    });
  }

  resetBaselineConditionFilters(condition: ConditionFormGroup)
  {
    if (this.groupByForm.get('groupBy')?.value.length == 0) return;

    const condId = condition.get('id')?.value!;

    // Se inicializa conditionFiltersInclusionTypeMap
    if (!this.conditionFiltersInclusionTypeMap.has(condId)) {
      this.conditionFiltersInclusionTypeMap.set(condId, new Map());
    }

    // Se inicializa conditionFiltersMap
    if (!this.conditionFiltersMap.has(condId)) {
      this.conditionFiltersMap.set(condId, new Map());
    }

    this.conditionFiltersMap.set(condId, new Map());

    const condMap = this.conditionFiltersMap.get(condId)!;

    let baselineType: string = this.isBaselinePastAverageAlert || this.isBaselinePastAveragePonderedAlert ? 'CDN' : 'QOE';
    this.inventoryBaselinesService.getDimensionValues(new DimensionValuesRequest(baselineType, this.selectedBaseline.id, this.groupByForm.get('groupBy')?.value!)).subscribe(
      (response) => 
      {
        for (const dimension in response) 
        {
          if (response.hasOwnProperty(dimension)) 
          {
            this.conditionFiltersInclusionTypeMap.get(condId)?.set(dimension, this.conditionFiltersInclusionTypeMap.get(condId)?.has(dimension) ? this.conditionFiltersInclusionTypeMap.get(condId)?.get(dimension) : this.dimensionValuesInclusionOptions[0]);

            if (condMap.has(dimension))
            {
              const filterValues: string[] = response[dimension];
              this.conditionFiltersMap.get(condId)!.set(dimension, new Map().set('values', filterValues).set('selected', filterValues).set('created', []).set('merge', filterValues));
            }
            else
            {
              condMap.set(dimension, new Map()
                .set('values', [])
                .set('selected', [])
                .set('created', [])
                .set('lost', [])
                .set('merge', []));
            }
          }
        }
      },
      (error) => {

      }
    );
  }

  intersectArrays(arrays: string[][]): string[] {
    if (!arrays.length) return [];

    return arrays.reduce((acc, curr) => {
      const set = new Set(curr);
      return acc.filter(v => set.has(v));
    });
  }

  generateGraphAgroupations(dimension: string) 
  {
    // Copia (nueva referencia)
    const nextMap = new Map(this.graphGroupBy);

    if (nextMap.has(dimension)) {
      nextMap.delete(dimension);
      this.graphGroupBy = nextMap;   // <-- cambia referencia
      return;
    }

    const observables: Observable<string[]>[] = [];

    this.indicatorArray.controls.forEach(indicator => {
      indicator.controls.metrics.controls.forEach(metric => {
        const metricField = metric.get('metric')?.value;
        if (!metricField) return;

        observables.push(
          this.alertService.getDimensionValues(
            metricField.bbdd!,
            metricField.table_name!,
            metricField.metric!,
            dimension
          )
        );
      });
    });

    if (!observables.length) {
      this.graphGroupBy = nextMap; // opcional
      return;
    }

    forkJoin(observables).subscribe({
      next: (responses: string[][]) => {
        const intersection = this.intersectArrays(responses);

        const updated = new Map(this.graphGroupBy);  // por si cambió mientras tanto
        updated.set(dimension, intersection);

        this.graphGroupBy = updated; // <-- NUEVA referencia => ngOnChanges salta
        this.requestGraphGroupBy = new Map(JSON.parse(JSON.stringify(Array.from(this.graphGroupBy))));
      },
      error: _err => {
        const updated = new Map(this.graphGroupBy);
        updated.set(dimension, []);
        this.graphGroupBy = updated; // <-- NUEVA referencia
        this.requestGraphGroupBy = new Map(JSON.parse(JSON.stringify(Array.from(this.graphGroupBy))));
      }
    });
  }


  onChangeGroupBy(event: MultiSelectChangeEvent)
  { 
    this.generateInternalNameAndName();

    // this.conditionFiltersMap = new Map();
    this.conditionArray.controls.forEach((condition: ConditionFormGroup) => {
      this.resetConditionFilters(condition);
    });

    if (event.itemValue)
      this.generateGraphAgroupations(event.itemValue);
    else
    {
      event.value.forEach((dimension: string) => {
        this.generateGraphAgroupations(dimension);
      });
    }
  }

  onChangeBaselineGroupBy()
  {
    this.generateInternalNameAndName();

    this.conditionArray.controls.forEach((condition: ConditionFormGroup) => {
      this.resetBaselineConditionFilters(condition);
    });
  }

  onChangeLogsGroupBy()
  {
    this.generateInternalNameAndName();

    this.conditionFiltersMap = new Map();
    this.conditionArray.controls.forEach((condition: ConditionFormGroup) => {
      this.resetLogsConditionFilters(condition);
    });
  }

  onFilter(e: { originalEvent: Event; filter: string }) {
    this.lastFilter = (e.filter ?? '').trim();
  }

  onClickCreateFilter(condition: ConditionFormGroup, dimension: string, ms: MultiSelect)
  {
    const createdFilter = (this.lastFilter ?? '').trim();
    if (!createdFilter) return;

    const condId = condition.get('id')?.value!;
    const dimMap = this.conditionFiltersMap.get(condId)?.get(dimension);
    if (!dimMap) return; // <- evita el crash

    const rawValues = dimMap.get('values');
    const rawSelected = dimMap.get('selected');
    const rawCreated = dimMap.get('created');
    const rawLost = dimMap.get('lost');

    const values   = Array.isArray(rawValues)   ? rawValues   : [];
    const selected = Array.isArray(rawSelected) ? rawSelected : [];
    const created  = Array.isArray(rawCreated)  ? rawCreated  : [];
    const lost     = Array.isArray(rawLost)     ? rawLost     : [];

    const newCreated = created.includes(createdFilter) ? created : [createdFilter, ...created];
    const newSelected = selected.includes(createdFilter) ? selected : [createdFilter, ...selected];
    const newMerge = Array.from(new Set([...newCreated, ...lost, ...values]));

    dimMap.set('created', newCreated);
    dimMap.set('selected', newSelected);
    dimMap.set('merge', newMerge);

    ms.resetFilter();
    this.lastFilter = '';
  }

  isCreated(option: string, condition: ConditionFormGroup, dimension: string): boolean 
  {
    const map = this.conditionFiltersMap.get(condition.get('id')?.value!)!.get(dimension)!;
    const created: string[] = map.get('created') || [];
    return created.includes(option);
  }

  isLost(option: string, condition: ConditionFormGroup, dimension: string): boolean
  {
    const map = this.conditionFiltersMap.get(condition.get('id')?.value!)!.get(dimension)!;
    const lost: string[] = map.get('lost') || [];
    return lost.includes(option);
  }

  onClickDeleteFilter(option: string, condition: ConditionFormGroup, dimension: string, ev: MouseEvent) 
  {
    // Evita que el click seleccione/deseleccione el ítem
    ev.stopPropagation();
    ev.preventDefault();

    const map = this.conditionFiltersMap.get(condition.get('id')?.value!)!.get(dimension)!;

    const created = [...(map.get('created') || [])];
    const selected = [...(map.get('selected') || [])];
    const merge    = [...(map.get('merge') || [])];

    // Elimina de 'created'
    const newCreated = created.filter(v => v !== option);
    // Elimina de 'selected' si estaba
    const newSelected = selected.filter(v => v !== option);
    // Elimina de 'merge'
    const newMerge = merge.filter(v => v !== option);

    // Escribe nuevas referencias (inmutables) para que Angular/PrimeNG detecten los cambios
    map.set('created', newCreated);
    map.set('selected', newSelected);
    map.set('merge', newMerge);
  }

  getBaselines()
  {
    this.baselinesListLoading = true;
    this.baselinesListError = false;

    this.inventoryBaselinesService.getBaselines(this.isBaselinePastAverageAlert ? 'past_average' : this.isBaselinePastAveragePonderedAlert ? 'past_average_pondered' : 'ksigma').subscribe(
      (response) => {

        this.baselineResponseList = response;
        
        this.baselinesListLoading = false;
        this.baselinesListError = false;
      },
      (error) => {
        this.baselinesListLoading = false;
        this.baselinesListError = true;
      }
    )
  }

  onChangeBaselinesVariablesConditionType(condition: ConditionFormGroup)
  {
    condition.controls.baselineVariables.get('auxVar1')?.reset();
    condition.controls.baselineVariables.get('auxVar2')?.reset();
    condition.controls.baselineVariables.get('auxVar3')?.reset();
    condition.controls.baselineVariables.updateValueAndValidity();
  }

  onChangeBaselineSelection()
  {
    this.getBaselineGroupByOptions();

    this.indicatorArray.clear();

    const newIndicator: IndicatorFormGroup = this._fb.group({
          id: this._fb.control(null),
          name: this._fb.control(this.selectedBaseline.alertIndicatorViewDto.name),
          metrics: this._fb.array<MetricFormGroup>([]),
          finalExpression: this._fb.control({value: this.selectedBaseline.alertIndicatorViewDto.finalExpression, disabled: true})
        }) as IndicatorFormGroup;

    this.selectedBaseline.alertIndicatorViewDto.alertMetrics.forEach((metric: any, j: number) => 
    {
      let metricList: TableMetricInfo[] = [];
      metricList.push(new TableMetricInfo(metric.dbName, metric.tableName, metric.metricName, []));
      newIndicator.controls.metrics.push(this._fb.group({
              metricId: this._fb.control(metric.metricId),
              id: this._fb.control((j + 1).toString()),
              name: this._fb.control(this.letters[0] + "." + (j + 1)),
              metric: this._fb.control({value: metricList[0], disabled: true}),
              operation: this._fb.control({value: matOperationOptions.find((opt) => opt.value == metric.operation), disabled: true}),
              options: this._fb.control(metricList),
              idInventory: this._fb.control(metric.idInventory)
            }) as MetricFormGroup)
    });

    this.indicatorArray.push(newIndicator);

    this.resultMetricMap.set(0, this.selectedBaseline.alertIndicatorViewDto.finalExpression);

    this.generateInternalNameAndName();
  }

  getGraphSeries()
  {
    this.graphSeriesLoading = true;
    this.graphSeriesError = false;
    
    let indicatorDataDtoList: AlertIndicatorDto[] = [];

    this.indicatorArray.controls.forEach((indicator, i) => {
      let metricDataDtoList: AlertMetricDto[] = [];
      indicator.get('metrics')?.value.forEach((metric, j) => {
        if (metric.metric != null && metric.metric.metric != null)
          metricDataDtoList.push(new AlertMetricDto(null, 'OSS_Platform', metric.metric!.table_name!, metric.metric!.metric!, metric.operation!.value!, '', null));
      });

      if (metricDataDtoList.length > 0)
        indicatorDataDtoList.push(new AlertIndicatorDto(null, indicator.get('name')?.value!, metricDataDtoList, indicator.get('finalExpression')?.value!, this.isBaselineAlert));
    });

    let groupBy: string[] = [];
    for(let key of this.requestGraphGroupBy.keys())
    {
      groupBy.push(key);
    }

    let graphRequest: GraphRequest = new GraphRequest(this.hours, groupBy, indicatorDataDtoList, this.requestGraphGroupBy);

    if (graphRequest.alertIndicators.length != 0)
    {
      this.plottingService.getGraphSeries(graphRequest).subscribe(
        (response) => {
          this.graphSeriesLoading = false;
          this.graphSeriesError = false;
          
          this.graphSeries = response;
        },
        (error) => {
          this.graphSeriesLoading = false;
          this.graphSeriesError = true;
        }
      )
    }
  }

  get status(): 'success' | 'db+dolphin' | 'db' | 'dolphin' | 'main' {
    if (this.isSuccess) return 'success';
    if (this.dbError && this.dolphinError) return 'db+dolphin';
    if (this.dbError) return 'db';
    if (this.dolphinError) return 'dolphin';
    return 'main';
  }

  getBaselineGroupByOptions()
  {
    this.baselineGroupByOptionsLoading = true;
    this.baselineGroupByOptionsError = false;

    this.inventoryBaselinesService.getBaselineGroupByOptions(this.isBaselinePastAverageAlert ? 'past_average' : this.isBaselinePastAveragePonderedAlert ? 'past_average_pondered' : 'ksigma').subscribe(
      (response) => {
        this.baselineGroupByOptionsLoading = false;
        this.baselineGroupByOptionsError = false;
        this.dimensionIntersectionOptions = response.map((dimension) => dimension.toLowerCase());
      },
      (error) => {
        this.baselineGroupByOptionsLoading = false;
        this.baselineGroupByOptionsError = true;
      }
    )
  }

  checkAllClausesCompleted()
  {
    let allCompleted = true;

    this.conditionArray.controls.forEach((condition) => {
      condition.get('clauses')?.value.forEach((clause: any) => 
      {
        if ( ((clause.comparation.value == 'MORE_THAN' || clause.comparation.value == 'LESS_THAN' || clause.comparation.value == 'EQUALS' || clause.comparation.value == 'NOT_EQUALS') && (clause.value == undefined || clause.value == null)) || ((clause.comparation.value == 'WITHIN_RANGE' || clause.comparation.value == 'OUT_OF_RANGE') && (clause.min == undefined || clause.min == null || clause.max == undefined || clause.max == null)))
        {
          allCompleted = false;
        }
      });

      if (condition.controls.baselineVariables.invalid)
      {
        allCompleted = false;
      }
    });

    return allCompleted;
  }

  graphGroupByEvent(event: Map<string, string[]>)
  {
    this.requestGraphGroupBy = event;

    this.getGraphSeries();
  }

  allIndicatorsCorrect()
  {
    let allValid = true;

    if (this.indicatorArray.length == 0 || this.indicatorArray.at(0).controls.metrics.length == 0)
    {
      allValid = false;
    }

    this.indicatorArray.controls.forEach((indicator) => {
      indicator.get('metrics')?.value.forEach((metric: any) => {
        if (metric.metric == null || metric.metric.metric == null)
        {
          allValid = false;
        }
      });
    });

    return allValid;
  }

  generateMetricTags() 
  {
    // Limpiamos los tags METRIC existentes
    this.tagList = this.tagList.filter(tag => tag.type !== 'METRIC');

    // Objeto temporal para almacenar los últimos valores no nulos
    let metricValues: any = {
      boltGroup: null,
      boltService: null,
      boltFunction: null,
      boltDataType: null,
      boltCategory: null
    };

    // Recorremos todos los indicadores
    this.indicatorArray.controls.forEach(indicator => {
      // Recorremos todas las métricas del indicador
      indicator.controls.metrics.controls.forEach(metricControl => {
        const metric = metricControl.get('metric')?.value;
        if (metric) {
          if (metric.boltGroup != null) metricValues.boltGroup = metric.boltGroup;
          if (metric.boltService != null) metricValues.boltService = metric.boltService;
          if (metric.boltFunction != null) metricValues.boltFunction = metric.boltFunction;
          if (metric.boltDataType != null) metricValues.boltDataType = metric.boltDataType;
          if (metric.boltCategory != null) metricValues.boltCategory = metric.boltCategory;
        }
      });
    });

    // Añadimos los tags solo si hay valor
    this.tagList.unshift(new Tag('bolt_source', metricValues.boltGroup, 'METRIC'));
    this.tagList.unshift(new Tag('bolt_service', metricValues.boltService, 'METRIC'));
    this.tagList.unshift(new Tag('bolt_funcion', metricValues.boltFunction, 'METRIC'));
    this.tagList.unshift(new Tag('bolt_data_type', metricValues.boltDataType, 'METRIC'));
    this.tagList.unshift(new Tag('bolt_category', metricValues.boltCategory, 'METRIC'));
  }

  selectTag(i: number)
  {
    if (this.selectedTagIndex === i)
    { 
      this.resetTagSelection();
      return; 
    }

    this.tagForm.get('name')?.enable();

    this.selectedTagIndex = i;
    this.tagForm.patchValue({
      name: this.tagList[i].name,
      value: this.tagList[i].value
    });

    if (this.tagList[i].type == 'METRIC')
    {
      this.tagForm.get('name')?.disable();
    }
  }

  resetTagSelection()
  {
    this.selectedTagIndex = null;
    this.tagForm.get('name')?.enable();
    this.tagForm.reset();
    this.tagForm.updateValueAndValidity();
  }

  onClickSaveTagChanges()
  {
    if (this.tagForm.invalid) return;

    const updatedTag = {
      ...this.tagList[this.selectedTagIndex!],
      ...this.tagForm.value
    };

    this.tagList[this.selectedTagIndex!] = updatedTag;
    this.resetTagSelection();
  }

  searchTagNames(event: any) {
    const query = event.query.toLowerCase();
    this.tagFilteredNames = this.tagNames.filter(n =>
      n.toLowerCase().includes(query)
    );
  }

  onHoverConditionInformationIcon(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.conditionInformationModalStyle = {
      position: 'fixed',
      top: `${rect.bottom + 16}px`,
      left: `${rect.left}px`,
      width: '1200px'
    };

    this.conditionInformationModalVisible = true;
  }

  onHoverMessageInformationIcon(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.messageInformationModalStyle = {
      position: 'fixed',
      top: `${rect.bottom + 16}px`,
      left: `${rect.left}px`,
      width: '1200px'
    };

    this.messageInformationModalVisible = true;
  }

  onHoverPermissionInformationIcon(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.permissionInformationModalStyle = {
      position: 'fixed',
      top: `${rect.bottom + 16}px`,
      left: `${rect.left}px`,
      width: '1200px'
    };

    this.permissionInformationModalVisible = true;
  }

  getInclusionType(condition: any, dimension: string): string {
    const condId = condition.get('id')?.value!;
    return this.conditionFiltersInclusionTypeMap.get(condId)?.get(dimension) ?? this.dimensionValuesInclusionOptions[0];
  }

  onChangeInclusionType(event: any, condition: any, dimension: string) {
    const condId = condition.get('id')?.value!;
    const newType = event;
    this.conditionFiltersInclusionTypeMap.set(condId, this.conditionFiltersInclusionTypeMap.get(condId)!.set(dimension, newType));
  }

  // ── Collapsible contains/not-contains filter per dimension ──────────────

  isDimensionFilterExpanded(condition: any, dimension: string): boolean {
    const condId = condition.get('id')?.value!;
    return this.dimensionFilterExpandedMap.get(condId)?.get(dimension) ?? false;
  }

  toggleDimensionFilter(condition: any, dimension: string): void {
    const condId = condition.get('id')?.value!;
    if (!this.dimensionFilterExpandedMap.has(condId)) {
      this.dimensionFilterExpandedMap.set(condId, new Map());
    }
    const current = this.dimensionFilterExpandedMap.get(condId)!.get(dimension) ?? false;
    this.dimensionFilterExpandedMap.get(condId)!.set(dimension, !current);
  }

  getDimensionContainsFilter(condition: any, dimension: string): { type: string; value: string; externalOperation: string } {
    const condId = condition.get('id')?.value!;
    if (!this.dimensionContainsFilterMap.has(condId)) {
      this.dimensionContainsFilterMap.set(condId, new Map());
    }
    if (!this.dimensionContainsFilterMap.get(condId)!.has(dimension)) {
      this.dimensionContainsFilterMap.get(condId)!.set(dimension, { type: 'CONTAINS', value: '', externalOperation: 'AND' });
    }
    return this.dimensionContainsFilterMap.get(condId)!.get(dimension)!;
  }

  setDimensionContainsFilterType(condition: any, dimension: string, type: string): void {
    const entry = this.getDimensionContainsFilter(condition, dimension);
    entry.type = type;
  }

  setDimensionContainsFilterValue(condition: any, dimension: string, value: string): void {
    const entry = this.getDimensionContainsFilter(condition, dimension);
    entry.value = value;
  }

  setDimensionContainsFilterExternalOperation(condition: any, dimension: string, externalOperation: string): void {
    const entry = this.getDimensionContainsFilter(condition, dimension);
    entry.externalOperation = externalOperation;
  }
}
