import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CreateAlertComponent } from './features/create-alert/create-alert.component';
import { CreateSimpleConditionAlertComponent } from './features/create-simple-condition-alert/create-simple-condition-alert.component';

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
  }
];
