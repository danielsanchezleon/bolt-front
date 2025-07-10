import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { Tag } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-table',
  imports: [ReactiveFormsModule, InputNumberModule, MultiSelectModule, FloatLabelModule, InputTextModule, InputIconModule, IconFieldModule, Tag, MenuModule, ButtonModule, CommonModule, TableModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  animations: [
    trigger('accordionAnimation', [
      state('closed', style({
        height: '0px',
        padding: '0 1rem',
        opacity: 0,
      })),
      state('open', style({
        height: '*',
        padding: '1rem',
        opacity: 1,
      })),
      transition('closed <=> open', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class TableComponent 
{
  @ViewChild('dt') dt: Table | undefined;

  @Input() data: any;

  columns: any[] = [];
  items: any[] = [];
  filteredItems: any[] = [];

  hasActions: boolean = false;
  hasFilters: boolean = false;
  hasBlueHeader: boolean = false;

  filterPanelOpen: boolean = false;

  filterForm!: FormGroup;

  constructor (private _fb: FormBuilder) {}

  ngOnInit()
  {
    this.columns = this.data.columns;
    this.items = this.data.items;
    this.filteredItems = [...this.items];

    if (this.data && this.data != null && this.data != undefined && this.data.actions.length > 0)
    {
      this.hasActions = true;
    }

    if (this.data && this.data != null && this.data != undefined && this.data.filters.length > 0)
    {
      this.hasFilters = true;

      const group: any = {};

      this.data.filters.forEach( (filter: any) => 
      {
        group[filter.value] = this._fb.control(null);
      });

      this.filterForm = this._fb.group(group);
    }
  }

  applyFilterGlobal($event: any, stringVal: any) 
  {
    const filterValue: string = ($event.target as HTMLInputElement).value.toLowerCase();

    this.filteredItems = this.items.filter( (item) =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(filterValue)
        )
    );
  }

  clearIndividualFilters()
  {
    this.filterForm.reset();
    this.filterForm.updateValueAndValidity();

    this.applyIndividualFilters();
  }

  applyIndividualFilters() {
    const filtrosAplicados = this.filterForm.value;
    
    this.filteredItems = this.items.filter( (item) => 
    {
      return this.data.filters.every( (filter: any) => 
      {
        const field = filter.value;
        const type = filter.type;
        const filterValue = filtrosAplicados[field];

        if (filterValue === null || filterValue === '' || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true; // Empty filters are not applied
        }

        const itemValue = item[field];

        switch (type) 
        {
          case 'text':
            return itemValue.toLowerCase().includes(filterValue.toString().toLowerCase());

          case 'num':
            return itemValue.toString() === filterValue.toString();

          case 'multiselect':
            return filterValue.includes(itemValue);

          default:
            return true;
        }
      });
    });
  }
}
