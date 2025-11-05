export class ChartMetricDto 
{
  name: string;
  operation: string;
  table: string;
  metric: string;

  constructor(name: string, table: string, metric: string, operation: string) 
  {
    this.name = name;
    this.operation = operation;
    this.table = table;
    this.metric = metric;
  }
}
