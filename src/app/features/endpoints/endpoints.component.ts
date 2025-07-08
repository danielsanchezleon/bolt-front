import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { endpointList } from '../../shared/constants/endpoints';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-endpoints',
  imports: [MenuModule, TableModule, ButtonModule, PageWrapperComponent],
  templateUrl: './endpoints.component.html',
  styleUrl: './endpoints.component.scss'
})
export class EndpointsComponent 
{
  endpointList: any[] = [];
  actionOptions: MenuItem[];

  constructor(private router: Router)
  {
    this.actionOptions = [
      {
        label: 'Editar',
        icon: 'pi pi-pencil'
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash'
      }
    ];
  }

  ngOnInit(): void 
  {
    this.endpointList = endpointList;
  }
  
  onClickNavigateToHome()
  {
    this.router.navigate(['']);
  }
}
