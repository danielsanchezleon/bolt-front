import { AlertMetricDto } from "./AlertMetricDto";

export class AlertIndicatorDto 
{
  constructor(
    public name: string,
    public alertMetrics: AlertMetricDto[] = []
  ) {}
}