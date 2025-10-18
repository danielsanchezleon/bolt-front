import { MetricDataDto } from "./MetricDataDto";

export class IndicatorDataDto {
  constructor(
    public metrics: MetricDataDto[]
  ) {}
}