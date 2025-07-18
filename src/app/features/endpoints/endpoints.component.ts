import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { endpointTable } from '../../shared/constants/endpoints';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TableComponent } from '../../shared/components/table/table.component';

@Component({
  selector: 'app-endpoints',
  imports: [TableComponent, MenuModule, TableModule, ButtonModule, PageWrapperComponent],
  templateUrl: './endpoints.component.html',
  styleUrl: './endpoints.component.scss'
})
export class EndpointsComponent 
{
  endpointTable: any[] = [];
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
    this.endpointTable = endpointTable;
  }
  
  onClickNavigateToHome()
  {
    this.router.navigate(['']);
  }
}
