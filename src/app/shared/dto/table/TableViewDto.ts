import { TableConfig } from "./TableConfig";

export class TableViewDto 
{
  tableConfig: TableConfig;
  rows: Array<Map<string, any>>;

  constructor(tableConfig: TableConfig, rows: Array<Map<string, any>>) 
  {
    this.tableConfig = tableConfig;
    this.rows = rows;
  }
}