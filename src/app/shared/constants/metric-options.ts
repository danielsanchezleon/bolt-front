export class MetricOptions
{
    maxMetricNumber: number = 5;
}

export const metricOperationOptions = [
    {
        value: 0,
        label: 'Sumar ( + )',
        symbol: '+',
        description: 'Sumar con la métrica anterior'
    },
    {
        value: 1,
        label: 'Restar ( - )',
        symbol: '-',
        description: 'Restar con la métrica anterior'
    },
    {
        value: 2,
        label: 'Multiplicar ( * )',
        symbol: '*',
        description: 'Multiplicar con la métrica anterior'
    },
    {
        value: 3,
        label: 'Dividir ( / )',
        symbol: '/',
        description: 'Dividir con la métrica anterior'
    }
];

export const operationOptions = [
    {value: 0, label: 'Media'},
    {value: 1, label: 'Suma'},
    {value: 2, label: 'Mínimo'},
    {value: 3, label: 'Máximo'},
    {value: 4, label: 'Count'}
];

export const timeWindowOptions = [
    {value: 1, label: '1 minuto'},
    {value: 5, label: '5 minutos'},
    {value: 10, label: '10 minutos'},
    {value: 15, label: '15 minutos'},
    {value: 30, label: '30 minutos'},
    {value: 60, label: '1 hora'},
    {value: 120, label: '2 horas'},
    {value: 180, label: '3 horas'},
    {value: 360, label: '6 horas'},
    {value: 720, label: '12 horas'},
    {value: 1440, label: '24 horas'}
];

export const discardTimeOptions = [
    {value: null, label: 'Sin descartar'},
    {value: 1, label: '1 minuto'},
    {value: 5, label: '5 minutos'},
    {value: 10, label: '10 minutos'},
    {value: 15, label: '15 minutos'}
];

export const periodicityOptions = [
    {value: 1, label: '1 minuto'},
    {value: 5, label: '5 minutos'},
    {value: 10, label: '10 minutos'},
    {value: 15, label: '15 minutos'},
    {value: 30, label: '30 minutos'},
    {value: 60, label: '1 hora'}
];
