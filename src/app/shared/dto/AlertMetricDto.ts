export class AlertMetricDto 
{
  constructor(
    public dbName: string,
    public tableName: string,
    public metricName: string,
    public operation: number,
    public order: number
  ) {}
}