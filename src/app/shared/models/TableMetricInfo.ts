export interface TableMetricInfo 
{
  bbdd: string;
  table_name: string;
  metric: string;
  data_type: string;
  is_nullable: string;
  dimension: string[];
  comments: string;
}