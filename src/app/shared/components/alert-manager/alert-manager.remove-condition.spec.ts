/**
 * Tests unitarios para AlertManagerComponent.removeCondition()
 *
 * Verifica que al eliminar una condición:
 *  1. La condición desaparece del FormArray.
 *  2. Los ids del resto de condiciones se reindexan correctamente (1..n).
 *  3. No queda ninguna entrada residual en:
 *     - conditionFiltersMap
 *     - conditionFiltersInclusionTypeMap
 *     - dimensionContainsFilterMap
 *     - dimensionFilterExpandedMap
 *  4. Los mapas de las condiciones supervivientes se reindexan bien (su clave
 *     en los mapas sigue siendo su nuevo id).
 *
 * Estrategia: se instancia el componente en TestBed con los proveedores mínimos
 * (todos los servicios se mockean) y se pre-populan los mapas manualmente antes
 * de llamar a removeCondition().
 */

import { TestBed, fakeAsync } from '@angular/core/testing';
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
import { severityOptions } from '../../constants/alert-constants';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Crea un objeto Map de dimension fake para conditionFiltersMap */
function makeDimMap(): Map<string, Map<string, string[]>> {
  const inner = new Map<string, string[]>();
  inner.set('values', ['v1', 'v2']);
  inner.set('selected', ['v1']);
  inner.set('created', []);
  inner.set('lost', []);
  inner.set('merge', ['v1', 'v2']);
  const outer = new Map<string, Map<string, string[]>>();
  outer.set('region', inner);
  return outer;
}

/** Crea un Map de inclusion type fake para conditionFiltersInclusionTypeMap */
function makeInclusionTypeMap(): Map<string, any> {
  const m = new Map<string, any>();
  m.set('region', { value: 'INCLUDE', label: 'Include' });
  return m;
}

/** Crea un Map de contains filter fake para dimensionContainsFilterMap */
function makeContainsMap(): Map<string, { type: string; value: string; externalOperation: string }> {
  const m = new Map<string, { type: string; value: string; externalOperation: string }>();
  m.set('region', { type: 'CONTAINS', value: 'foo', externalOperation: 'AND' });
  return m;
}

/** Crea un Map de expanded fake para dimensionFilterExpandedMap */
function makeExpandedMap(): Map<string, boolean> {
  const m = new Map<string, boolean>();
  m.set('region', true);
  return m;
}

// ─── setup ──────────────────────────────────────────────────────────────────

describe('AlertManagerComponent – removeCondition()', () => {
  let component: AlertManagerComponent;

  const routerMock = { navigate: jasmine.createSpy('navigate') };
  const activatedRouteMock = {
    snapshot: {
      paramMap: { has: () => false, get: () => null },
      params: {}
    }
  };
  const alertServiceMock = {
    getAlert: () => of({}),
    getAllTeams: () => of([]),
    existsByInternalName: () => of(null),
    getDimensionValues: () => of([])
  };
  const metricServiceMock = { getMetrics: () => of([]) };
  const endpointServiceMock = { getEndpointsByType: () => of({}) };
  const authServiceMock = { isAdmin: () => true, getTeam: () => 1 };
  const alertOcurrencesMock = { getDistinctValuesForDimension: () => of([]) };
  const inventoryBaselinesMock = {
    getBaselines: () => of([]),
    getDimensionValues: () => of({})
  };
  const plottingServiceMock = { getGraphSeries: () => of([]) };

  beforeEach(async () => {
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
      ]
    }).compileComponents();

    component = TestBed.createComponent(AlertManagerComponent).componentInstance;
    component.isSimpleConditionAlert = true;

    // Silenciar métodos que dependen de servicios externos o la UI
    spyOn(component as any, 'buildConditionGraphsList').and.stub();
    spyOn(component as any, 'resetConditionFilters').and.stub();
    spyOn(component as any, 'resetLogsConditionFilters').and.stub();
    spyOn(component as any, 'resetBaselineConditionFilters').and.stub();
    spyOn(component, 'resetSeverityOptions').and.stub();
  });

  /**
   * Agrega N condiciones al array y puebla los 4 mapas para cada una,
   * usando la clave string (index+1).
   */
  function setupConditions(n: number) {
    for (let i = 0; i < n; i++) {
      component.createCondition();
      const key = (i + 1).toString();
      component.conditionFiltersMap.set(key, makeDimMap() as any);
      component.conditionFiltersInclusionTypeMap.set(key, makeInclusionTypeMap());
      component.dimensionContainsFilterMap.set(key, makeContainsMap());
      component.dimensionFilterExpandedMap.set(key, makeExpandedMap());
    }
  }

  // ─── caso 1: eliminar la única condición ──────────────────────────────────

  it('debe eliminar la única condición y dejar todos los mapas vacíos', () => {
    setupConditions(1);

    component.removeCondition(0);

    expect(component.conditionArray.length).toBe(0);
    expect(component.conditionFiltersMap.size).toBe(0);
    expect(component.conditionFiltersInclusionTypeMap.size).toBe(0);
    expect(component.dimensionContainsFilterMap.size).toBe(0);
    expect(component.dimensionFilterExpandedMap.size).toBe(0);
  });

  // ─── caso 2: dos condiciones, eliminar la primera ────────────────────────

  it('con 2 condiciones, al eliminar la primera la segunda pasa a ser la 1 y no queda rastro de la original', () => {
    setupConditions(2);

    // Verificamos estado inicial
    expect(component.conditionFiltersMap.has('1')).toBeTrue();
    expect(component.conditionFiltersMap.has('2')).toBeTrue();
    expect(component.dimensionContainsFilterMap.get('2')!.get('region')!.value).toBe('foo');

    component.removeCondition(0); // elimina condición con id '1'

    // Solo debe quedar 1 condición
    expect(component.conditionArray.length).toBe(1);
    expect(component.conditionArray.at(0).get('id')?.value).toBe('1');

    // La clave '2' ya no debe existir en ningún mapa
    expect(component.conditionFiltersMap.has('2')).toBeFalse();
    expect(component.conditionFiltersInclusionTypeMap.has('2')).toBeFalse();
    expect(component.dimensionContainsFilterMap.has('2')).toBeFalse();
    expect(component.dimensionFilterExpandedMap.has('2')).toBeFalse();

    // La clave '1' (antigua '2') sí debe existir y conservar sus datos
    expect(component.conditionFiltersMap.has('1')).toBeTrue();
    expect(component.conditionFiltersInclusionTypeMap.has('1')).toBeTrue();
    expect(component.dimensionContainsFilterMap.has('1')).toBeTrue();
    expect(component.dimensionContainsFilterMap.get('1')!.get('region')!.value).toBe('foo');
    expect(component.dimensionFilterExpandedMap.has('1')).toBeTrue();
    expect(component.dimensionFilterExpandedMap.get('1')!.get('region')).toBeTrue();
  });

  // ─── caso 3: dos condiciones, eliminar la segunda ────────────────────────

  it('con 2 condiciones, al eliminar la segunda la primera no se toca', () => {
    setupConditions(2);

    component.removeCondition(1); // elimina condición con id '2'

    expect(component.conditionArray.length).toBe(1);
    expect(component.conditionArray.at(0).get('id')?.value).toBe('1');

    // La clave '2' eliminada no debe existir
    expect(component.conditionFiltersMap.has('2')).toBeFalse();
    expect(component.conditionFiltersInclusionTypeMap.has('2')).toBeFalse();
    expect(component.dimensionContainsFilterMap.has('2')).toBeFalse();
    expect(component.dimensionFilterExpandedMap.has('2')).toBeFalse();

    // La clave '1' (primera condición) se conserva intacta
    expect(component.conditionFiltersMap.has('1')).toBeTrue();
    expect(component.conditionFiltersInclusionTypeMap.has('1')).toBeTrue();
    expect(component.dimensionContainsFilterMap.has('1')).toBeTrue();
    expect(component.dimensionFilterExpandedMap.has('1')).toBeTrue();
  });

  // ─── caso 4: tres condiciones, eliminar la del medio ─────────────────────

  it('con 3 condiciones, al eliminar la del medio (índice 1) los ids y mapas se reindexan bien', () => {
    setupConditions(3);

    component.removeCondition(1); // elimina condición con id '2'

    expect(component.conditionArray.length).toBe(2);
    expect(component.conditionArray.at(0).get('id')?.value).toBe('1');
    expect(component.conditionArray.at(1).get('id')?.value).toBe('2');

    // Clave '3' eliminada (reindexada a '2')
    expect(component.conditionFiltersMap.has('3')).toBeFalse();
    expect(component.conditionFiltersInclusionTypeMap.has('3')).toBeFalse();
    expect(component.dimensionContainsFilterMap.has('3')).toBeFalse();
    expect(component.dimensionFilterExpandedMap.has('3')).toBeFalse();

    // Clave '1' (primera) sigue existiendo
    expect(component.conditionFiltersMap.has('1')).toBeTrue();
    expect(component.dimensionContainsFilterMap.has('1')).toBeTrue();

    // Clave '2' ahora contiene los datos de la antigua condición 3
    expect(component.conditionFiltersMap.has('2')).toBeTrue();
    expect(component.dimensionContainsFilterMap.has('2')).toBeTrue();
    expect(component.dimensionContainsFilterMap.get('2')!.get('region')!.value).toBe('foo');
  });

  // ─── caso 5: tres condiciones, eliminar la primera ───────────────────────

  it('con 3 condiciones, al eliminar la primera los dos restantes quedan con ids 1 y 2', () => {
    setupConditions(3);

    component.removeCondition(0); // elimina condición con id '1'

    expect(component.conditionArray.length).toBe(2);
    expect(component.conditionArray.at(0).get('id')?.value).toBe('1');
    expect(component.conditionArray.at(1).get('id')?.value).toBe('2');

    // Claves '3' y la original '1' no deben existir
    expect(component.conditionFiltersMap.has('3')).toBeFalse();
    expect(component.dimensionContainsFilterMap.has('3')).toBeFalse();

    // Clave '1' ahora contiene la antigua condición 2
    expect(component.conditionFiltersMap.has('1')).toBeTrue();
    expect(component.dimensionContainsFilterMap.get('1')!.get('region')!.value).toBe('foo');

    // Clave '2' ahora contiene la antigua condición 3
    expect(component.conditionFiltersMap.has('2')).toBeTrue();
    expect(component.dimensionContainsFilterMap.get('2')!.get('region')!.value).toBe('foo');
  });

  // ─── caso 6: eliminar dos veces consecutivas ─────────────────────────────

  it('al eliminar dos veces el índice 0 de 3 condiciones, queda solo 1 condición con id=1 y mapas limpios', () => {
    setupConditions(3);

    component.removeCondition(0); // queda [2→1, 3→2]
    component.removeCondition(0); // queda [2→1]

    expect(component.conditionArray.length).toBe(1);
    expect(component.conditionArray.at(0).get('id')?.value).toBe('1');

    expect(component.conditionFiltersMap.size).toBe(1);
    expect(component.conditionFiltersInclusionTypeMap.size).toBe(1);
    expect(component.dimensionContainsFilterMap.size).toBe(1);
    expect(component.dimensionFilterExpandedMap.size).toBe(1);

    expect(component.conditionFiltersMap.has('1')).toBeTrue();
    expect(component.dimensionContainsFilterMap.get('1')!.get('region')!.value).toBe('foo');
  });

  // ─── caso 7: los datos de contains de la condición eliminada no se filtran a las demás ──

  it('los datos CONTAINS de la condición eliminada no aparecen en ninguna condición superviviente', () => {
    setupConditions(2);

    // Condición 1 tiene contains 'foo', condición 2 tiene 'bar'
    component.dimensionContainsFilterMap.get('2')!.set('region', { type: 'NOT_CONTAINS', value: 'bar', externalOperation: 'OR' });

    component.removeCondition(0); // elimina condición '1' (la de 'foo')

    // La condición superviviente (antigua 2, ahora 1) debe tener 'bar'
    const entry = component.dimensionContainsFilterMap.get('1')!.get('region')!;
    expect(entry.value).toBe('bar');
    expect(entry.type).toBe('NOT_CONTAINS');

    // No debe existir clave '2'
    expect(component.dimensionContainsFilterMap.has('2')).toBeFalse();
  });
});
