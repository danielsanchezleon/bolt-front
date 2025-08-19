import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { EndpointViewDto } from '../../shared/dto/endpoint/EndpointViewDto';
import { EndpointService } from '../../shared/services/endpoint.service';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import { debounceTime, Subject } from 'rxjs';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-endpoints',
  imports: [MenuModule, TableModule, ButtonModule, PageWrapperComponent, ReactiveFormsModule, InputNumberModule, MultiSelectModule, FloatLabelModule, InputTextModule, InputIconModule, IconFieldModule, Tag, MenuModule, CommonModule, FormsModule, SkeletonModule, PaginatorModule, PopoverModule],
  templateUrl: './endpoints.component.html',
  styleUrl: './endpoints.component.scss'
})
export class EndpointsComponent 
{
  private filterSubject = new Subject<string>();
  filterText = '';
  actionOptions: MenuItem[];

  //Pagination
  first: number = 0;
  page: number = 0;
  size: number = 10;

  isLoading: boolean = false;
  isError: boolean = false;

  endpointPage: any = {};
  endpointList: EndpointViewDto[] = [];
  endpointListFiltered: EndpointViewDto[] = [];

  selectedEndpoint: EndpointViewDto | null = null;
  tableActions: any[] = [{label: 'Eliminar', value: 'delete', icon: 'pi pi-trash', command: () => {this.onClickDeleteEndpoint(this.selectedEndpoint);}}]

  isLoadingDelete: boolean = false;
  isSuccessDelete: boolean = false;
  isErrorDelete: boolean = false;

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
    this.filterSubject
    .pipe(debounceTime(500)) // Espera 1 segundo desde la última tecla
    .subscribe(filtro => {
      this.getEndpoints(this.page, this.size);
    });

    this.getEndpoints(this.page, this.size);
  }
  
  onClickNavigateToHome()
  {
    this.router.navigate(['']);
  }

  onClickNavigateToCreateEndpoint()
  {
    this.router.navigate(['crear-endpoint']);
  }

  getEndpoints(page: number, size: number)
  {
    this.isLoading = true;
    this.isError = false;

    this.endpointService.getEndpoints(page, size, this.filterText ? this.filterText : null).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.isError = false;

        this.endpointPage = response;
        this.endpointList = response.content;
        this.endpointListFiltered = response.content;
      },
      (error: any) => {
        this.isLoading = false;
        this.isError = true;
      }
    );
  }

  onClickDeleteEndpoint(endpoint: EndpointViewDto | null)
  {
    this.isLoadingDelete = true;
    this.isSuccessDelete = false;
    this.isErrorDelete = false;

    this.endpointService.deleteEndpoint(endpoint?.id!).subscribe(
      (response) => {
        this.selectedEndpoint = null;
        this.isLoadingDelete = false;
        this.isSuccessDelete = true;
        this.isErrorDelete = false;

        this.getEndpoints(this.page, this.size);
      },
      (error) => {
        this.selectedEndpoint = null;
        this.isLoadingDelete = false;
        this.isSuccessDelete = false;
        this.isErrorDelete = true;
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

  onPageChange(event: any) 
  {
    this.first = event.first;
    this.page = event.page;
    this.size = event.rows;

    this.getEndpoints(this.page, this.size);
  }

  onFilterEndpointsChange() 
  {
    this.filterSubject.next(this.filterText);
  }
}
