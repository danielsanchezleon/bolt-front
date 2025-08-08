import { AlertConditionViewDto } from "./AlertConditionViewDto";
import { AlertIndicatorViewDto } from "./AlertIndicatorViewDto";
import { TagViewDto } from "./TagViewDto";

export class AlertViewDto {
  alertId?: number;
  name?: string;
  alertText?: string;
  evaluationFrequency?: string;
  evaluationPeriod?: string;
  createdAt?: Date;
  alertTags?: TagViewDto[];
  conditions?: AlertConditionViewDto[];
  indicators?: AlertIndicatorViewDto[];
}