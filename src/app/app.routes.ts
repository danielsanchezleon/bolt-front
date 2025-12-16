import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CreateAlertComponent } from './features/create-alert/create-alert.component';
import { EndpointsComponent } from './features/endpoints/endpoints.component';
import { ModifyAlertComponent } from './features/modify-alert/modify-alert.component';
import { CreateLogsAlertComponent } from './features/create-logs-alert/create-logs-alert.component';
import { CreateEndpointComponent } from './features/create-endpoint/create-endpoint.component';
import { LoginComponent } from './features/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { TestComponent } from './features/test/test.component';
import { AlertManagerComponent } from './shared/components/alert-manager/alert-manager.component';
import { UsersComponent } from './features/users/users.component';
import { CreateUserComponent } from './features/create-user/create-user.component';
import { SetPasswordComponent } from './features/set-password/set-password.component';
import { EditUserComponent } from './features/edit-user/edit-user.component';
import { UserComponent } from './features/user/user.component';
import { AnalyticsModuleComponent } from './features/analytics-module/analytics-module.component';

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
    path: 'crear-endpoint',
    component: CreateEndpointComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'endpoints',
    component: EndpointsComponent,
    canActivate: [AuthGuard,RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'alerts',
    component: ModifyAlertComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'test',
    component: TestComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'alert/create/:alert_type',
    component: AlertManagerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'alert/create/:alert_type/:alert_subtype',
    component: AlertManagerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'alert/edit/:alert_type/:alert_id',
    component: AlertManagerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'usuarios',
    component: UsersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'crear-usuario',
    component: CreateUserComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
   {
    path: 'establecer-contrasena',
    component: SetPasswordComponent
  },
  {
    path: 'usuarios/:id/editar',
    component: EditUserComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'user/:user_id',
    component: UserComponent,
    canActivate: [AuthGuard, RoleGuard]
  },
  {
    path: 'analytics-module',
    component: AnalyticsModuleComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  }

];
