import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CreateAlertComponent } from './features/create-alert/create-alert.component';
import { EndpointsComponent } from './features/endpoints/endpoints.component';
import { ModifyAlertComponent } from './features/modify-alert/modify-alert.component';
import { CreateLogsAlertComponent } from './features/create-logs-alert/create-logs-alert.component';
import { CreateEndpointComponent } from './features/create-endpoint/create-endpoint.component';
import { LoginComponent } from './features/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { TestComponent } from './features/test/test.component';
import { AlertManagerComponent } from './shared/components/alert-manager/alert-manager.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'alert/create',
    component: CreateAlertComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'alert/create/simple',
    component: AlertManagerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'crear-endpoint',
    component: CreateEndpointComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'endpoints',
    component: EndpointsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'alerts',
    component: ModifyAlertComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'logs',
    component: CreateLogsAlertComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'test',
    component: TestComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'alert/:alert_type/edit/:alert_id',
    component: AlertManagerComponent,
    canActivate: [AuthGuard]
  }
];
