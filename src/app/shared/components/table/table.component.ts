import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { Tag } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-table',
  imports: [InputTextModule, InputIconModule, IconFieldModule, Tag, MenuModule, ButtonModule, CommonModule, TableModule],
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

  filterPanelOpen: boolean = false;

  constructor () {}

  ngOnInit()
  {
    this.columns = this.data.columns;
    this.items = this.data.items;
    this.filteredItems = [...this.items];

    if (this.data && this.data != null && this.data != undefined && this.data.actions.length > 0)
    {
      this.hasActions = true;
    }
  }

  applyFilterGlobal($event: any, stringVal: any) 
  {
    const filterValue: string = ($event.target as HTMLInputElement).value.toLowerCase();

    this.filteredItems = this.items.filter( (item) =>
        Object.values(item).some(valor =>
            String(valor).toLowerCase().includes(filterValue)
        )
    );
  }
}
