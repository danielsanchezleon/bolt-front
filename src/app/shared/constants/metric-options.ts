export class MetricOptions
{
    maxMetricNumber: number = 5;
}

export const metricOperationOptions = [
    {
        value: 'add',
        label: 'Sumar ( + )',
        symbol: '+',
        description: 'Sumar con la métrica anterior'
    },
    {
        value: 'subtract',
        label: 'Restar ( - )',
        symbol: '-',
        description: 'Restar con la métrica anterior'
    },
    {
        value: 'multiply',
        label: 'Multiplicar ( * )',
        symbol: '*',
        description: 'Multiplicar con la métrica anterior'
    },
    {
        value: 'divide',
        label: 'Dividir ( / )',
        symbol: '/',
        description: 'Dividir con la métrica anterior'
    }
];

export const operationOptions = [
    {value: 'avg', label: 'Media'},
    {value: 'sum', label: 'Suma'},
    {value: 'min', label: 'Mínimo'},
    {value: 'max', label: 'Máximo'},
    {value: 'count', label: 'Count'}
];

export const timeWindowOptions = [
    {value: '1min', label: '1 minuto'},
    {value: '5min', label: '5 minutos'},
    {value: '10min', label: '10 minutos'},
    {value: '15min', label: '15 minutos'},
    {value: '30min', label: '30 minutos'},
    {value: '1h', label: '1 hora'},
    {value: '2h', label: '2 horas'},
    {value: '3h', label: '3 horas'},
    {value: '6h', label: '6 horas'},
    {value: '12h', label: '12 horas'},
    {value: '24h', label: '24 horas'}
];

export const discardTimeOptions = [
    {value: 'null', label: 'Sin descartar'},
    {value: '1min', label: '1 minuto'},
    {value: '5min', label: '5 minutos'},
    {value: '10min', label: '10 minutos'},
    {value: '15min', label: '15 minutos'}
];

export const periodicityOptions = [
    {value: '1min', label: '1 minuto'},
    {value: '5min', label: '5 minutos'},
    {value: '10min', label: '10 minutos'},
    {value: '15min', label: '15 minutos'},
    {value: '30min', label: '30 minutos'},
    {value: '1h', label: '1 hora'}
];
