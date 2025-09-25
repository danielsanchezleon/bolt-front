export class TableMetricInfo 
{
  bbdd?: string;
  table_name?: string;
  metric?: string;
  dimension?: string[];

  constructor (bbdd?: string, table_name?: string, metric?: string, dimension?: string[])
  {
    this.bbdd = bbdd;
    this.table_name = table_name;
    this.metric = metric;
    this.dimension = dimension;
  }
}