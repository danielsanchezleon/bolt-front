import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CreateAlertComponent } from './features/create-alert/create-alert.component';
import { CreateSimpleConditionAlertComponent } from './features/create-simple-condition-alert/create-simple-condition-alert.component';
import { EndpointsComponent } from './features/endpoints/endpoints.component';
import { ModifyAlertComponent } from './features/modify-alert/modify-alert.component';
import { CreateLogsAlertComponent } from './features/create-logs-alert/create-logs-alert.component';
import { CreateEndpointComponent } from './features/create-endpoint/create-endpoint.component';
import { LoginComponent } from './features/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { TestComponent } from './features/test/test.component';
import { UsersComponent } from './features/users/users.component';
import { CreateUserComponent } from './features/create-user/create-user.component';

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
    path: 'crear-alerta',
    component: CreateAlertComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'condicion-simple',
    component: CreateSimpleConditionAlertComponent,
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
    path: 'modificar-alerta',
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
    path: 'usuarios',
    component: UsersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'crear-usuario',
    component: CreateUserComponent,
    canActivate: [AuthGuard]
  }

];
