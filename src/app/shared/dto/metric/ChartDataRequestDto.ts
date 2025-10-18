import { IndicatorDataDto } from "./IndicatorDataDto";

export class ChartDataRequestDto {
  constructor(
    public indicators: IndicatorDataDto[],
    public groupBy: string[],
    public evaluationPeriod: string,
    public hours: number
  ) {}
}