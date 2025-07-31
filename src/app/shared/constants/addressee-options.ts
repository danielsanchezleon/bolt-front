export const channelOptions = [
    {value: 0, label: 'Email', icon: 'pi-envelope'},
    {value: 1, label: 'Teams', icon: 'pi-comment'},
    {value: 2, label: 'Webhook', icon: 'pi-comments'},
    {value: 3, label: 'PagerDuty', icon: 'pi-sitemap'}
];

export const alertOptions = [
    {value: 0, label: 'Disaster'},
    {value: 1, label: 'Critical'},
    {value: 2, label: 'Major'},
    {value: 3, label: 'Warning'}
];

export const conditionalBlockOptions = [
    {value: 'is_alert', label: '#is_alert', description: 'Mostrar cuando hay alerta activa', type: 'cb'},
    {value: 'is_recovery', label: '#is_recovery', description: 'Mostrar cuando se recupera la alerta', type: 'cb'},
    {value: 'is_warning', label: '#is_warning', description: 'Mostrar para alertas de warning', type: 'cb'},
    {value: 'is_alert_recovery', label: '#is_alert_recovery', description: 'Mostrar en transiciones alerta-recuperación', type: 'cb'},
    {value: 'is_no_data', label: '#is_no_data', description: 'Mostrar cuando no hay datos', type: 'cb'}
];

export const templateVariableOptions = [
    {value: 'metric_name', label: 'metric_name', description: 'Nombre de la métrica', type: 'tv'},
    {value: 'metric_value', label: 'metric_value', description: 'Valor actual de la métrica', type: 'tv'},
    {value: 'alert_level', label: 'alert_level', description: 'Nivel de criticidad de la alerta', type: 'tv'},
    {value: 'timestamp', label: 'timestamp', description: 'Marca de tiempo del evento', type: 'tv'},
];