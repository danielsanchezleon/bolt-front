export const testAlerts = [
  {
    id: 'test-alert-1',
    name: 'CPU Usage Critical - Test',
    description: 'Alerta de prueba para monitorear uso crítico de CPU',
    createdBy: 'admin',
    createdAt: 'hace 2 minutos',
    severity: 'high',
    lastTriggered: 'hace 2 horas',
    triggersLastDay: 8,
    metricName: 'system.cpu.usage',
    operationMethod: 'avg',
    timeWindow: '5min',
    periodicity: '1min',
    conditionType: 'threshold',
    enabled: true,
    thresholds: {
      alert: '90',
      warning: '75'
    },
    missingDataAction: 'no-action',
    permissions: {
      operaciones: 'read',
      observabilidad: 'read'
    },
    definedThresholds: [
      {
        id: 'threshold-1',
        type: 'greater-than',
        criticalityLevel: 'critical',
        value1: '90',
        appliedFilters: { environment: ['production'], service: ['web-server'] }
      },
      {
        id: 'threshold-2',
        type: 'greater-than',
        criticalityLevel: 'warning',
        value1: '75',
        appliedFilters: { environment: ['production'] }
      }
    ],
    configuredFilters: { environment: ['production'], service: ['web-server'] },
    groupByTags: ['environment', 'service'],
    tags: { team: 'infrastructure', priority: 'high' },
    definedTags: [],
    definedEndpoints: [
      {value: 'email', label: 'Email', icon: 'pi-envelope'},
      {value: 'teams', label: 'Teams', icon: 'pi-comment'},
      {value: 'webhook', label: 'Webhook', icon: 'pi-comments'},
      {value: 'pagerduty', label: 'PagerDuty', icon: 'pi-sitemap'}
    ]
  },
  {
    id: 'test-alert-2',
    name: 'Memory Low - Test',
    description: 'Alerta de prueba para memoria baja disponible',
    createdBy: 'admin',
    createdAt: 'hace 5 horas',
    severity: 'medium',
    lastTriggered: 'hace 45 minutos',
    triggersLastDay: 3,
    metricName: 'system.memory.available',
    operationMethod: 'min',
    timeWindow: '10min',
    periodicity: '5min',
    conditionType: 'threshold',
    enabled: true,
    thresholds: {
      warning: '500'
    },
    missingDataAction: 'no-action',
    permissions: {
      operaciones: 'read',
      observabilidad: 'read'
    },
    definedThresholds: [
      {
        id: 'threshold-3',
        type: 'less-than',
        criticalityLevel: 'major',
        value1: '500',
        appliedFilters: { environment: ['production'], region: ['us-east-1'] }
      }
    ],
    configuredFilters: { environment: ['production'], region: ['us-east-1'] },
    groupByTags: ['environment', 'region'],
    tags: { team: 'platform', component: 'memory' },
    definedTags: [
      {
        name: 'name1',
        value: 'value1'
      },
      {
        name: 'name2',
        value: 'value2'
      },
      {
        name: 'name3',
        value: 'value3'
      },
      {
        name: 'name4',
        value: 'value4'
      }
    ],
    definedEndpoints: [
      {value: 'email', label: 'Email', icon: 'pi-envelope'},
      {value: 'teams', label: 'Teams', icon: 'pi-comment'}
    ]
  },
  {
    id: 'test-alert-3',
    name: 'API Response Time - Test',
    description: 'Alerta de prueba para tiempo de respuesta de API',
    createdBy: 'admin',
    createdAt: 'hace 10 dias',
    severity: 'low',
    lastTriggered: 'hace 6 horas',
    triggersLastDay: 1,
    metricName: 'api.response_time',
    operationMethod: 'avg',
    timeWindow: '15min',
    periodicity: '5min',
    conditionType: 'threshold',
    enabled: false,
    thresholds: {
      warning: '2000'
    },
    missingDataAction: 'no-action',
    permissions: {
      operaciones: 'read',
      observabilidad: 'read'
    },
    definedThresholds: [
      {
        id: 'threshold-4',
        type: 'greater-than',
        criticalityLevel: 'warning',
        value1: '2000',
        appliedFilters: { service: ['api-gateway'], version: ['v2'] }
      }
    ],
    configuredFilters: { service: ['api-gateway'], version: ['v2'] },
    groupByTags: ['service', 'version'],
    tags: { team: 'backend', type: 'performance' },
    definedTags: [
      {
        name: 'name1',
        value: 'value1'
      },
      {
        name: 'name2',
        value: 'value2'
      }
    ],
    definedEndpoints: [
      {value: 'email', label: 'Email', icon: 'pi-envelope'}
    ]
  },
  {
    id: 'test-alert-4',
    name: 'Disk Space Usage - Test',
    description: 'Alerta de prueba para uso excesivo de espacio en disco',
    createdBy: 'admin',
    createdAt: 'hace 2 años',
    severity: 'high',
    lastTriggered: 'hace 1 minuto',
    triggersLastDay: 0,
    metricName: 'system.disk.usage',
    operationMethod: 'max',
    timeWindow: '30min',
    periodicity: '10min',
    conditionType: 'threshold',
    enabled: true,
    thresholds: {
      alert: '85',
      warning: '75'
    },
    missingDataAction: 'no-action',
    permissions: {
      operaciones: 'read',
      observabilidad: 'read'
    },
    definedThresholds: [
      {
        id: 'threshold-5',
        type: 'greater-than',
        criticalityLevel: 'critical',
        value1: '85',
        appliedFilters: { environment: ['production'], mount: ['/var', '/home'] }
      },
      {
        id: 'threshold-6',
        type: 'greater-than',
        criticalityLevel: 'major',
        value1: '75',
        appliedFilters: { environment: ['production'] }
      }
    ],
    configuredFilters: { environment: ['production'], mount: ['/var', '/home'] },
    groupByTags: ['environment', 'mount'],
    tags: { team: 'infrastructure', component: 'storage' },
    definedTags: [
      {
        name: 'name1',
        value: 'value1'
      },
      {
        name: 'name2',
        value: 'value2'
      },
      {
        name: 'name3',
        value: 'value3'
      },
      {
        name: 'name4',
        value: 'value4'
      },
      {
        name: 'name5',
        value: 'value5'
      },
      {
        name: 'name6',
        value: 'value6'
      },
      {
        name: 'name7',
        value: 'value7'
      },
      {
        name: 'name8',
        value: 'value8'
      }
    ],
    definedEndpoints: [
      {value: 'email', label: 'Email', icon: 'pi-envelope'},
      {value: 'teams', label: 'Teams', icon: 'pi-comment'},
      {value: 'webhook', label: 'Webhook', icon: 'pi-comments'},
      {value: 'pagerduty', label: 'PagerDuty', icon: 'pi-sitemap'}
    ]
  }
];