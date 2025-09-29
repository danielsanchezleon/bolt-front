import { TableAction } from "./TableAction";
import { TableColumn } from "./TableColumn";
import { TablePagination } from "./TablePagination";
import { TableSelection } from "./TableSelection";

export class TableConfig 
{
  title?: string | null;
  columns: TableColumn[];
  selection?: TableSelection | null;
  rowActions?: TableAction[] | null;
  tableActions?: TableAction[] | null;
  pagination?: TablePagination | null;
  rowIdField: string;

  constructor(
    rowIdField: string,
    columns: TableColumn[],
    title?: string | null,
    selection?: TableSelection | null,
    rowActions?: TableAction[] | null,
    tableActions?: TableAction[] | null,
    pagination?: TablePagination | null
  ) 
  {
    this.rowIdField = rowIdField;
    this.columns = columns;
    this.title = title ?? null;
    this.selection = selection ?? null;
    this.rowActions = rowActions ?? null;
    this.tableActions = tableActions ?? null;
    this.pagination = pagination ?? null;
  }
}