import { AlertMetricViewDto } from "./AlertMetricViewDto";

export class AlertIndicatorViewDto {
  id?: number;
  name?: string;
  alertMetrics?: AlertMetricViewDto[];
  finalExpression?: string;
  isBaseline?: boolean;
}