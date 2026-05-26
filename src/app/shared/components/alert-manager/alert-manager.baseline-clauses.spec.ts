/**
 * Tests unitarios para el manejo de clauses en alertas de tipo BASELINE
 * en modo edición (edit).
 *
 * Bug original: cuando se cargaba una alerta baseline con una sola clause ('B'),
 * la condición `condition.alertClauses?.length! > 1` era falsa y la clause
 * nunca se cargaba al form. En el guardado, la clause tampoco se añadía en
 * edit mode, por lo que `alertClauses: []` se enviaba al backend.
 *
 * Fix: cambiar `> 1` por `>= 1` en la condición de carga.
 *
 * Estos tests verifican:
 *  1. (Carga)  fromDtoToForm con 1 clause en una condición baseline → la clause
 *              queda en el FormArray con su clauseId original.
 *  2. (Guardado) onClickConfirmCrupdateAlert en modo edit baseline → el servicio
 *              se llama con alertClauses no vacío y con el id correcto.
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AlertManagerComponent } from './alert-manager.component';
import { MetricService } from '../../services/metric.service';
import { AlertService } from '../../services/alert.service';
import { EndpointService } from '../../services/endpoint.service';
import { AuthService } from '../../services/auth.service';
import { AlertOcurrencesService } from '../../services/alert-ocurrences.service';
import { InventoryBaselinesService } from '../../services/inventory-baselines.service';
import { PlottingService } from '../../services/plotting.service';
import {
  clauseComparationOptions,
  severityOptions,
  baselinesVariablesConditionTypes,
} from '../../constants/alert-constants';
import { AlertViewDto } from '../../dto/alert/AlertViewDto';
import { AlertConditionViewDto } from '../../dto/alert/AlertConditionViewDto';
import { AlertClauseViewDto } from '../../dto/alert/AlertClauseViewDto';

// ─── mocks de servicios ──────────────────────────────────────────────────────

const routerMock = { navigate: jasmine.createSpy('navigate') };
const activatedRouteMock = {
  snapshot: {
    paramMap: { has: () => false, get: () => null },
    params: {},
  },
};
const alertServiceMock = {
  getAlert: () => of({}),
  getAllTeams: () => of([]),
  existsByInternalName: () => of(null),
  getDimensionValues: () => of([]),
  crupdateAlert: jasmine.createSpy('crupdateAlert').and.returnValue(
    of({ dbSuccess: true, dolphinSuccess: true })
  ),
};
const metricServiceMock = { getMetrics: () => of([]) };
const endpointServiceMock = { getEndpointsByType: () => of({}) };
const authServiceMock = { isAdmin: () => true, getTeam: () => 1 };
const alertOcurrencesMock = { getDistinctValuesForDimension: () => of([]) };
const inventoryBaselinesMock = {
  getBaselines: () => of([]),
  getBaselineDimensionValues: () => of([]),
};
const plottingServiceMock = { getGraphSeries: () => of([]) };

// ─── helper: crea un AlertViewDto mínimo de tipo baseline ───────────────────

function makeBaselineAlertViewDto(clauseId: number = 42): AlertViewDto {
  const clause = new AlertClauseViewDto(
    clauseId,   // id
    'B',        // indicatorName
    null,       // startBrackets
    'MORE_THAN',// compOperation
    null,       // threshold
    null,       // endBrackets
    0,          // order
    null,       // externalOperation
    null,       // thresholdInclude
    null,       // thresholdUp
    null        // thresholdIncludeUp
  );

  const condition = new AlertConditionViewDto('CRITICAL', true);
  condition.id = 100;
  condition.alertClauses = [clause];
  condition.conditionFilters = [];

  const dto = new AlertViewDto();
  dto.alertId = 99;
  dto.baselineType = 'PAST_AVERAGE';
  dto.evaluationPeriod = '5m';
  dto.evaluationFrequency = '1m';
  dto.offset = null as any; // null coincide con discardTimeOptions[0].value
  dto.alarmNumPeriods = 2;
  dto.alarmTotalPeriods = 2;
  dto.recoveryNumPeriods = 2;
  dto.recoveryTotalPeriods = 2;
  dto.groupBy = [];
  dto.conditions = [condition];
  dto.indicators = [];
  dto.silencePeriods = [];
  dto.endpoints = [];
  dto.permissions = [];
  dto.alertTags = [];

  return dto;
}

// ─── setup ──────────────────────────────────────────────────────────────────

describe('AlertManagerComponent – baseline clauses en modo edit', () => {
  let component: AlertManagerComponent;

  beforeEach(async () => {
    alertServiceMock.crupdateAlert = jasmine
      .createSpy('crupdateAlert')
      .and.returnValue(of({ dbSuccess: true, dolphinSuccess: true }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AlertManagerComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: AlertService, useValue: alertServiceMock },
        { provide: MetricService, useValue: metricServiceMock },
        { provide: EndpointService, useValue: endpointServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: AlertOcurrencesService, useValue: alertOcurrencesMock },
        { provide: InventoryBaselinesService, useValue: inventoryBaselinesMock },
        { provide: PlottingService, useValue: plottingServiceMock },
      ],
    }).compileComponents();

    component = TestBed.createComponent(AlertManagerComponent).componentInstance;

    // Propiedades que normalmente setea ngOnInit y se necesitan para fromDtoToForm
    component.clauseComparationOptions = clauseComparationOptions;
    component.severityOptions = severityOptions.map(s => ({ ...s }));
    component.baselinesVariablesConditionTypes = baselinesVariablesConditionTypes;

    // Modo: edición de alerta baseline
    component.mode = 'edit';
    component.isBaselineAlert = true;
    component.isBaselinePastAverageAlert = true;
    component.alertId = 99;

    // Silenciar métodos que dependen de servicios externos o producen side-effects
    spyOn(component as any, 'loadBaselines').and.stub();
    spyOn(component, 'resetSeverityOptions').and.stub();
    spyOn(component as any, 'buildConditionGraphsList').and.stub();
  });

  // ─── test 1: carga ──────────────────────────────────────────────────────

  it('debe cargar la única clause de una condición baseline en el FormArray con su clauseId', fakeAsync(() => {
    const dto = makeBaselineAlertViewDto(42);

    component.fromDtoToForm(dto);
    tick(); // deja que el micro-task queue se vacíe

    // La condición debe existir
    expect(component.conditionArray.length)
      .withContext('conditionArray debe tener 1 condición')
      .toBe(1);

    const clauses = component.conditionArray.at(0).controls.clauses;

    // La clause debe haberse cargado (antes del fix length era 0)
    expect(clauses.length)
      .withContext('la condición debe tener 1 clause cargada')
      .toBe(1);

    // El clauseId debe ser el del DTO original
    expect(clauses.at(0).get('clauseId')?.value)
      .withContext('clauseId debe coincidir con el id de la clause del DTO')
      .toBe(42);

    // El indicatorName debe ser 'B'
    expect(clauses.at(0).get('indicatorName')?.value)
      .withContext('indicatorName debe ser B')
      .toBe('B');
  }));

  // ─── test 2: múltiples clauses también se cargan ────────────────────────

  it('debe cargar todas las clauses cuando una condición baseline tiene más de una', fakeAsync(() => {
    const dto = makeBaselineAlertViewDto(42);

    // Agregar una segunda clause con id 43
    const secondClause = new AlertClauseViewDto(43, 'B', null, 'LESS_THAN', null, null, 1, 'AND', null, null, null);
    dto.conditions![0].alertClauses!.push(secondClause);

    component.fromDtoToForm(dto);
    tick();

    const clauses = component.conditionArray.at(0).controls.clauses;
    expect(clauses.length).withContext('debe haber 2 clauses').toBe(2);
    expect(clauses.at(0).get('clauseId')?.value).toBe(42);
    expect(clauses.at(1).get('clauseId')?.value).toBe(43);
  }));

  // ─── test 3: guardado envía la clause con su id original ────────────────

  it('onClickConfirmCrupdateAlert en edit mode debe enviar alertClauses con el id de la clause', fakeAsync(() => {
    // Cargar el DTO para poblar el form
    const dto = makeBaselineAlertViewDto(42);
    component.fromDtoToForm(dto);
    tick();

    // Verificación previa: la clause está en el form
    const clauses = component.conditionArray.at(0).controls.clauses;
    expect(clauses.length).toBe(1);

    // Inicializar mapas de filtros que onClickConfirmCrupdateAlert necesita
    const condId = component.conditionArray.at(0).get('id')?.value!;
    component.conditionFiltersMap.set(condId, new Map());
    component.conditionFiltersInclusionTypeMap.set(condId, new Map());
    component.dimensionContainsFilterMap.set(condId, new Map());

    // selectedBaseline necesario para la rama baseline de crupdateAlert
    component.selectedBaseline = { baselineTable: 'tbl_baseline', name: 'baseline_test', idInventory: 1 } as any;

    // Ejecutar el guardado
    component.onClickConfirmCrupdateAlert();
    tick();

    // El servicio debe haber sido llamado
    expect(alertServiceMock.crupdateAlert).toHaveBeenCalled();

    // Extraer el AlertDto que se envió
    const sentAlertDto = alertServiceMock.crupdateAlert.calls.mostRecent().args[1];

    // Debe haber 1 condición
    expect(sentAlertDto.alertConditions?.length)
      .withContext('debe haber 1 condición enviada')
      .toBe(1);

    const sentClauses = sentAlertDto.alertConditions![0].alertClauses;

    // La clause NO debe estar vacía (era el bug original)
    expect(sentClauses?.length)
      .withContext('alertClauses no debe ser vacío en edit mode')
      .toBe(1);

    // Debe enviar el id original de la clause (para que el backend haga upsert)
    expect(sentClauses![0].id)
      .withContext('el id de la clause debe ser el original (42)')
      .toBe(42);

    // El indicatorName debe apuntar al indicador no-baseline ('A'), no al baseline ('B')
    expect(sentClauses![0].indicatorName)
      .withContext('la clause debe apuntar al indicador no-baseline A')
      .toBe('A');
  }));

  // ─── test 4: en create mode, la clause apunta al indicador no-baseline ('A') con id null ─────────

  it('en create mode la clause apunta al indicador no-baseline con id null', fakeAsync(() => {
    component.mode = 'create';

    // En create mode no se carga ningún DTO; se configura el form manualmente
    // como si el usuario hubiera creado 1 condición
    component.createCondition();

    // La condición en create mode no tiene clauses (el form empieza vacío)
    expect(component.conditionArray.at(0).controls.clauses.length).toBe(0);

    // Inicializar mapas
    const condId = component.conditionArray.at(0).get('id')?.value!;
    component.conditionFiltersMap.set(condId, new Map());
    component.conditionFiltersInclusionTypeMap.set(condId, new Map());
    component.dimensionContainsFilterMap.set(condId, new Map());

    // selectedBaseline necesario para la rama baseline create de crupdateAlert
    component.selectedBaseline = { baselineTable: 'tbl_baseline', name: 'baseline_test', idInventory: 1 } as any;

    component.onClickConfirmCrupdateAlert();
    tick();

    expect(alertServiceMock.crupdateAlert).toHaveBeenCalled();

    const sentAlertDto = alertServiceMock.crupdateAlert.calls.mostRecent().args[1];
    const sentClauses = sentAlertDto.alertConditions![0].alertClauses;

    // En create mode se genera exactamente 1 clause con id null
    expect(sentClauses?.length)
      .withContext('en create mode debe generarse exactamente 1 clause')
      .toBe(1);

    expect(sentClauses![0].id)
      .withContext('en create mode el id de la clause debe ser null')
      .toBeNull();

    expect(sentClauses![0].indicatorName)
      .withContext('la clause en create mode debe apuntar al indicador no-baseline A')
      .toBe('A');
  }));
});
