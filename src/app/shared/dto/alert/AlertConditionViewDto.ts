import { AlertClauseViewDto } from "./AlertClauseViewDto";
import { ConditionFilterViewDto } from "./ConditionFilterViewDto";

export class AlertConditionViewDto {
  severity?: string;
  status: boolean = false;
  conditionFilters?: ConditionFilterViewDto[];
  alertClauses?: AlertClauseViewDto[];
}