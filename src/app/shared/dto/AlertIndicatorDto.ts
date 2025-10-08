import { AlertMetricDto } from "./AlertMetricDto";

export class AlertIndicatorDto 
{
  constructor(
    public id: number | null,
    public name: string,
    public alertMetrics: AlertMetricDto[] = [],
    public finalExpression: string
  ) {}
}