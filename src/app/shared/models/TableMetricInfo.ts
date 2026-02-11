export class TableMetricInfo 
{
  bbdd?: string | null;
  table_name?: string | null;
  metric?: string;
  dimension?: string[];
  boltGroup?: string;

  constructor (bbdd?: string | null, table_name?: string | null, metric?: string, dimension?: string[], boltGroup?: string)
  {
    this.bbdd = bbdd;
    this.table_name = table_name;
    this.metric = metric;
    this.dimension = dimension;
    this.boltGroup = boltGroup;
  }
}