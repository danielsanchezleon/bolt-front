export class AlertMetricDto 
{
  constructor(
    public metricName: string,
    public operation: number,
    public order: number
  ) {}
}