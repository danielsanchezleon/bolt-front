import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { endpointTable } from '../../shared/constants/endpoints';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TableComponent } from '../../shared/components/table/table.component';
import { EndpointViewDto } from '../../shared/dto/endpoint/EndpointViewDto';
import { EndpointService } from '../../shared/services/endpoint.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-endpoints',
  imports: [MenuModule, TableModule, ButtonModule, PageWrapperComponent, ReactiveFormsModule, InputNumberModule, MultiSelectModule, FloatLabelModule, InputTextModule, InputIconModule, IconFieldModule, Tag, MenuModule, CommonModule, FormsModule],
  templateUrl: './endpoints.component.html',
  styleUrl: './endpoints.component.scss'
})
export class EndpointsComponent 
{
  filterText = '';
  actionOptions: MenuItem[];

  endpointList: EndpointViewDto[] = [];
  endpointListFiltered: EndpointViewDto[] = [];

  selectedEndpoint: EndpointViewDto | null = null;
  tableActions: any[] = [{label: 'Eliminar', value: 'delete', icon: 'pi pi-trash', command: () => {this.onClickDeleteEndpoint(this.selectedEndpoint);}}]

  isLoading: boolean = false;
  isSuccess: boolean = false;
  isError: boolean = false;

  constructor(private router: Router, private endpointService: EndpointService)
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
    this.getEndpoints();
  }
  
  onClickNavigateToHome()
  {
    this.router.navigate(['']);
  }

  onClickNavigateToCreateEndpoint()
  {
    this.router.navigate(['crear-endpoint']);
  }

  getEndpoints()
  {
    this.endpointService.getEndpoints(null).subscribe(
      (response) => {
        this.endpointList = response;
        this.endpointListFiltered = response;
      },
      (error) => {

      }
    );
  }

  onClickDeleteEndpoint(endpoint: EndpointViewDto | null)
  {
    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;

    this.endpointService.deleteEndpoint(endpoint?.id!).subscribe(
      (response) => {
        this.selectedEndpoint = null;
        this.isLoading = false;
        this.isSuccess = true;
        this.isError = false;

        this.getEndpoints();
      },
      (error) => {
        this.selectedEndpoint = null;
        this.isLoading = false;
        this.isSuccess = false;
        this.isError = true;
      }
    );
  }

  applyFilterGlobal($event: any, stringVal: any) 
  {
    const filterValue: string = ($event.target as HTMLInputElement).value.toLowerCase();

    this.endpointListFiltered = this.endpointList.filter( (endpoint) =>
        Object.values(endpoint).some(value =>
          String(value).toLowerCase().includes(filterValue)
        )
    );
  }
}
