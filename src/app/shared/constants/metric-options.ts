export class MetricOptions
{
    maxMetricNumber: number = 5;
}

export const metricOperationOptions = [
    {
        value: 0,
        valueStr: 'ADD',
        label: 'Sumar ( + )',
        symbol: '+',
        description: 'Sumar con la métrica anterior'
    },
    {
        value: 1,
        valueStr: 'SUBTRACT',
        label: 'Restar ( - )',
        symbol: '-',
        description: 'Restar con la métrica anterior'
    },
    {
        value: 2,
        valueStr: 'MULTIPLY',
        label: 'Multiplicar ( * )',
        symbol: '*',
        description: 'Multiplicar con la métrica anterior'
    },
    {
        value: 3,
        valueStr: 'DIVIDE',
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
    {value: 4, label: 'Count'},
    {value: 5, label: 'Último'},
];

export const timeWindowOptions = [
    {value: "60", label: '1 minuto'},
    {value: "300", label: '5 minutos'},
    {value: "600", label: '10 minutos'},
    {value: "900", label: '15 minutos'},
    {value: "1800", label: '30 minutos'},
    {value: "3600", label: '1 hora'},
    {value: "7200", label: '2 horas'},
    {value: "10800", label: '3 horas'},
    {value: "21600", label: '6 horas'},
    {value: "43200", label: '12 horas'},
    {value: "86400", label: '24 horas'}
];

export const modifyAlertTimeWindowOptions = [
    {value: "1m", label: '1 m'},
    {value: "5m", label: '5 m'},
    {value: "10m", label: '10 m'},
    {value: "15m", label: '15 m'},
    {value: "30m", label: '30 m'},
    {value: "1h", label: '1 h'},
    {value: "2h", label: '2 h'},
    {value: "3h", label: '3 h'},
    {value: "6h", label: '6 h'},
    {value: "12h", label: '12 h'},
    {value: "24h", label: '24 h'}
];

export const discardTimeOptions = [
    {value: null, label: 'Sin descartar'},
    {value: 1, label: '1 minuto'},
    {value: 5, label: '5 minutos'},
    {value: 10, label: '10 minutos'},
    {value: 15, label: '15 minutos'}
];

export const periodicityOptions = [
    {value: "1m", label: '1 m'},
    {value: "5m", label: '5 m'},
    {value: "10m", label: '10 m'},
    {value: "15m", label: '15 m'},
    {value: "30m", label: '30 m'},
    {value: "1h", label: '1 h'}
];
