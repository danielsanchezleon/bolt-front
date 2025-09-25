export class AlertMetricDto 
{
  constructor(
    public id: number | null,
    public dbName: string,
    public tableName: string,
    public metricName: string,
    public operation: string
  ) {}
}