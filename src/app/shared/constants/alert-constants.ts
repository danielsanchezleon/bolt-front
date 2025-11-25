export class MetricOptions
{
    maxMetricNumber: number = 5;
}

//STEP 1

export const matOperationOptions = [
    {value: 'AVG', label: 'Media'},
    {value: 'SUM', label: 'Suma'},
    {value: 'MIN', label: 'Mínimo'},
    {value: 'MAX', label: 'Máximo'},
    {value: 'COUNT', label: 'Count'},
    {value: 'LAST', label: 'Último'},
    {value: 'MEDIAN', label: 'Mediana'},
];

export const timeWindowOptions = [
    {value: "1m", label: '1 minuto'},
    {value: "5m", label: '5 minutos'},
    {value: "10m", label: '10 minutos'},
    {value: "15m", label: '15 minutos'},
    {value: "30m", label: '30 minutos'},
    {value: "1h", label: '1 hora'},
    {value: "2h", label: '2 horas'},
    {value: "3h", label: '3 horas'},
    {value: "6h", label: '6 horas'}
];

export const discardTimeOptions = [
    {value: null, label: 'Sin descartar'},
    {value: 1, label: '1 minuto'},
    {value: 5, label: '5 minutos'},
    {value: 10, label: '10 minutos'},
    {value: 15, label: '15 minutos'}
];

export const periodicityOptions = [
    {value: "1m", label: '1 minuto'},
    {value: "5m", label: '5 minutos'},
    {value: "10m", label: '10 minutos'},
    {value: "15m", label: '15 minutos'},
    {value: "30m", label: '30 minutos'},
    {value: "1h", label: '1 hora'}
];

//LOGS
export const advancedSearchOptions = [
    {value: 'CONTAINS', label: 'Contiene'},
    {value: 'NOT_CONTAINS', label: 'No contiene'},
    {value: 'EQUALS', label: 'Es igual a (texto exacto)'},
    {value: 'NOT_EQUALS', label: 'No es igual a (texto exacto)'},
    {value: 'REGEX', label: 'Coincide con expresión regular (regex)'},
    {value: 'NOT_REGEX', label: 'No coincide con expresión regular (regex)'},
    {value: 'GREATER_THAN', label: 'Mayor que (>)'},
    {value: 'LESS_THAN', label: 'Menor que (<)'},
    {value: 'GREATER_THAN_OR_EQUAL', label: 'Mayor o igual que (>=)'},
    {value: 'LESS_THAN_OR_EQUAL', label: 'Menor o igual que (<=)'}
];

//STEP 2

export const severityOptions = [
    {value: 'DISASTER', label: 'Disaster', disabled: true},
    {value: 'CRITICAL', label: 'Critical', disabled: true},
    {value: 'MAJOR', label: 'Major', disabled: true},
    {value: 'WARNING', label: 'Warning', disabled: true}
];

export const clauseComparationOptions = [
    {value: 'MORE_THAN', label: 'Mayor que'},
    {value: 'LESS_THAN', label: 'Menor que'},
    {value: 'WITHIN_RANGE', label: 'Dentro del rango'},
    {value: 'OUT_OF_RANGE', label: 'Fuera del rango'}
];

export const activationRecoverEvaluationOptions = [
    {value: 1, label: '1'},
    {value: 2, label: '2'},
    {value: 3, label: '3'},
    {value: 4, label: '4'},
    {value: 5, label: '5'},
    {value: 6, label: '6'},
    {value: 7, label: '7'},
    {value: 8, label: '8'},
    {value: 9, label: '9'},
    {value: 10, label: '10'}
];

export const silencePeriodDayOptions = [
    {value: 0, label: 'Lunes'},
    {value: 1, label: 'Martes'},
    {value: 2, label: 'Miércoles'},
    {value: 3, label: 'Jueves'},
    {value: 4, label: 'Viernes'},
    {value: 5, label: 'Sábado'},
    {value: 6, label: 'Domingo'}
];

//BASELINES

export const baselinesClauseComparationOptions = [
    {value: 'MORE_THAN', label: 'Mayor que'},
    {value: 'LESS_THAN', label: 'Menor que'}
];

export const baselinesVariablesConditionTypes = [
    {value: 'MORE_THAN', label: 'Superior a la baseline'},
    {value: 'LESS_THAN', label: 'Inferior a la baseline'},
    {value: 'OUT_OF_RANGE', label: 'Fuera del rango'}
];

export const baselinesComparationTypes = [
    {value: 'COMP_WITH_THRESHOLD', label: 'Comparar con umbral'},
    {value: 'COMP_WITH_INDICATOR', label: 'Comparar con indicador'}
];

//STEP 3
export const endpointTypeOptions = [
    {value: 'email', label: 'Email', icon: 'pi-envelope'},
    {value: 'pagerduty', label: 'PagerDuty', icon: 'pi-sitemap'}
];