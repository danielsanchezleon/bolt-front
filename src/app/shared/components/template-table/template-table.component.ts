import { Component, Input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TableViewDto } from '../../dto/table/TableViewDto';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-template-table',
  imports: [TableModule, CommonModule, MenuModule, ButtonModule],
  templateUrl: './template-table.component.html',
  styleUrl: './template-table.component.scss'
})
export class TemplateTableComponent 
{
  @Input("data") data: TableViewDto | null = null;

  constructor(){}

  ngOnInit()
  {
  }
}
