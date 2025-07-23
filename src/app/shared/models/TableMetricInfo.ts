export interface TableMetricInfo 
{
  tableSchema: string;
  tableName: string;
  columnName: string;
  value: string;
  label: string;
  dataType: string;
  isNullable: string;
  tags: string[];
}