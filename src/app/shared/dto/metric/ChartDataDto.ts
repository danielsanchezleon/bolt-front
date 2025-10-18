import { MetricDataSetDto } from "./MetricDataSetDto";

export class ChartDataDto {
  labels: string[];
  metrics: MetricDataSetDto[];

  constructor(labels: string[], metrics: MetricDataSetDto[]) {
    this.labels = labels;
    this.metrics = metrics;
  }
}
