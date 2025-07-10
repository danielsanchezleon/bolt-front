import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CreateAlertComponent } from './features/create-alert/create-alert.component';
import { CreateSimpleConditionAlertComponent } from './features/create-simple-condition-alert/create-simple-condition-alert.component';
import { EndpointsComponent } from './features/endpoints/endpoints.component';
import { ModifyAlertComponent } from './features/modify-alert/modify-alert.component';
import { CreateLogsAlertComponent } from './features/create-logs-alert/create-logs-alert.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'crear-alerta',
    component: CreateAlertComponent,
  },
  {
    path: 'condicion-simple',
    component: CreateSimpleConditionAlertComponent,
  },
  {
    path: 'endpoints',
    component: EndpointsComponent,
  },
  {
    path: 'modificar-alerta',
    component: ModifyAlertComponent,
  },
  {
    path: 'logs',
    component: CreateLogsAlertComponent,
  }
];
