import { ChartMetricDto } from "./ChartMetricDto";

export class ChartIndicatorDto {

  name: string;
  expression: string;
  metrics: ChartMetricDto[]

  constructor(name: string, expression: string, metrics: ChartMetricDto[]) 
  {
    this.name = name;
    this.expression = expression;
    this.metrics = metrics;
  }
}