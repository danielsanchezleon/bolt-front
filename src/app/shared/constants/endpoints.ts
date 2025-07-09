export const endpointTable: any = {
    size: 'large',
    grid: false,
    strippedRows: true,
    filter: true,
    searchPlaceholder: 'Buscar alertas por nombre, descripción o etiquetas',
    columns: [
        {label: 'Nombre', value: 'name', type: 'text', headerStyles: '', columnStyles: 'font-weight: 600;'},
        {label: 'URL/Destino', value: 'url', type: 'text' , headerStyles: '', columnStyles: ''},
        {label: 'Tipo', value: 'type', type: 'tag' , headerStyles: 'text-align: center;', columnStyles: 'text-align: center;'},
        {label: 'Alertas configuradas', value: 'alertCount', type: 'text' , headerStyles: 'text-align: center;', columnStyles: 'text-align: center;'},
        {label: 'Fecha', value: 'date', type: 'text' , headerStyles: 'text-align: center;', columnStyles: 'text-align: center;'}
    ],
    items: [
        {name: 'Notificaciones Frontend', url: 'frontend@empresa.com', type: 'Email', alertCount: '12', date: '2024-01-15'},
        {name: 'Notificaciones Backend', url: 'backend@empresa.com', type: 'Email', alertCount: '8', date: '2024-01-10'},
        {name: 'Canal Desarrollo', url: 'https://teams.microsoft.com/l/channel/...', type: 'Teams', alertCount: '5', date: '2024-01-08'},
        {name: 'Canal Alertas', url: 'https://hooks.webhook.com/services/...', type: 'Webhook', alertCount: '15', date: '2024-01-05'},
        {name: 'Incidentes Críticos', url: 'https://events.pagerduty.com/integration/...', type: 'PagerDuty', alertCount: '3', date: '2024-01-03'}
    ],
    actions: [
        {label: 'Editar', value: 'edit', icon: 'pi pi-pencil'},
        {label: 'Eliminar', value: 'delete', icon: 'pi pi-trash'}
    ]
};