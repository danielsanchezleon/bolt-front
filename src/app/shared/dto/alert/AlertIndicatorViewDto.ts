import { AlertMetricViewDto } from "./AlertMetricViewDto";

export class AlertIndicatorViewDto {
  id?: number;
  name?: string;
  alertMetrics?: AlertMetricViewDto[];
  constantOp?: number;
  constantValue?: number;
  finalExpression?: string;
}