export class MetricOptions
{
    maxMetricNumber: number = 5;
}

export interface Metric
{
    value: string;
    label: string;
    description: string;
    tags: string[];
    metadata?: string[];
};

export const metricList: Metric[] = [
    {
        value: 'cpu.uso',
        label: 'CPU - Uso',
        description: 'Porcentaje de uso de CPU',
        tags: ['OB', 'host']
    },
    {
        value: 'happiness.score',
        label: 'Happiness Score',
        description: 'Puntuación de satisfacción del usuario',
        tags: ['OB', 'service']
    },
    {
        value: 'errores.404.cdn',
        label: 'Errores 404/CDN',
        description: 'Número de errores 404 detectados',
        tags: ['OB', 'OS', 'contenido'],
        metadata: ['source:CDN', 'site:Azure']
    },
    {
        value: 'errores.404.gvp',
        label: 'Errores 404/GVP',
        description: 'Número de errores 404 detectados',
        tags: ['OB', 'OS', 'contenido'],
        metadata: ['source:GVP', 'site:Azure']
    },
    {
        value: 'errores.404.ppgg',
        label: 'Errores 404/ppgg/kernel',
        description: 'Número de errores 404 detectados',
        tags: ['OB', 'OS', 'contenido'],
        metadata: ['source:ppgg/kernel', 'site:Azure']
    },
    {
        value: 'plays.cdn',
        label: 'Plays/CDN',
        description: 'Número de reproducciones de contenido',
        tags: ['OB', 'device', 'service'],
        metadata: ['source:CDN']
    },
    {
        value: 'plays.gvp',
        label: 'Plays/GVP',
        description: 'Número de reproducciones de contenido',
        tags: ['OB', 'device', 'service'],
        metadata: ['source:GVP']
    },
    {
        value: 'plays.ppgg',
        label: 'Plays/ppgg/kernel',
        description: 'Número de reproducciones de contenido',
        tags: ['OB', 'device', 'service'],
        metadata: ['source:ppgg/kernel']
    },
    {
        value: 'errores.totales.cdn',
        label: 'Errores totales/CDN',
        description: 'Número total de errores detectados',
        tags: ['OB', 'OS', 'contenido'],
        metadata: ['source:CDN', 'site:Azure']
    },
    {
        value: 'errores.totales.gvp',
        label: 'Errores totales/GVP',
        description: 'Número total de errores detectados',
        tags: ['OB', 'OS', 'contenido'],
        metadata: ['source:GVP', 'site:Azure']
    },
    {
        value: 'errores.totales.ppgg',
        label: 'Errores totales/ppgg/kernel',
        description: 'Número total de errores detectados',
        tags: ['OB', 'OS', 'contenido'],
        metadata: ['source:ppgg/kernel', 'site:Azure']
    }
];

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
