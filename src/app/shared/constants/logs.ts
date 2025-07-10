export const logOptions = [
  { value: 'application-logs', label: 'Logs de Aplicación', description: 'Logs generados por aplicaciones' },
  { value: 'system-logs', label: 'Logs de Sistema', description: 'Logs del sistema operativo' },
  { value: 'security-logs', label: 'Logs de Seguridad', description: 'Logs de eventos de seguridad' },
  { value: 'access-logs', label: 'Logs de Acceso', description: 'Logs de acceso web y API' },
  { value: 'error-logs', label: 'Logs de Error', description: 'Logs de errores y excepciones' },
  { value: 'orchestrator-logs', label: 'Logs de Orquestador', description: 'Logs del sistema orquestador' }
];

export const logTagOptions = ['OB', 'service', 'host', 'platform'];

export const operationOptions = [
    {value: 'count', label: 'Count'}
];

export const timeWindowOptions = [
    {value: '5min', label: '5 minutos'},
    {value: '10min', label: '10 minutos'},
    {value: '30min', label: '30 minutos'},
    {value: '1h', label: '1 hora'},
    {value: '3h', label: '3 horas'},
    {value: '6h', label: '6 horas'},
    {value: '24h', label: '24 horas'}
];

export const periodicityOptions = [
    {value: '5min', label: '5 minutos'},
    {value: '10min', label: '10 minutos'},
    {value: '15min', label: '15 minutos'},
    {value: '30min', label: '30 minutos'},
    {value: '1h', label: '1 hora'}
];