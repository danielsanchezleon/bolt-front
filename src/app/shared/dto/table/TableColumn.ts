export class TableColumn {
  columnName: string;
  columnNameLabel: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'currency' | 'custom' | null;
  sortable?: boolean;
  hidden?: boolean;
  width?: string | null;
  align?: 'left' | 'center' | 'right' | null;
  format?: string | null;
  styles?: Map<string, string> | null;

  constructor(
    columnName: string,
    columnNameLabel: string,
    type?: 'text' | 'number' | 'date' | 'badge' | 'currency' | 'custom' | null,
    sortable: boolean = false,
    hidden: boolean = false,
    width?: string | null,
    align?: 'left' | 'center' | 'right' | null,
    format?: string | null,
    styles?: Map<string, string> | null
  ) {
    this.columnName = columnName;
    this.columnNameLabel = columnNameLabel;
    this.type = type ?? null;
    this.sortable = sortable;
    this.hidden = hidden;
    this.width = width ?? null;
    this.align = align ?? null;
    this.format = format ?? null;
    this.styles = styles ?? null;
  }
}