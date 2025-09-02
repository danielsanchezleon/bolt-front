import { AlertClauseViewDto } from "./AlertClauseViewDto";
import { ConditionFilterViewDto } from "./ConditionFilterViewDto";

export class AlertConditionViewDto {
  id?: number;
  severity?: string;
  status: boolean = false;
  conditionFilters?: ConditionFilterViewDto[];
  alertClauses?: AlertClauseViewDto[];

  constructor(severity: string, status: boolean)
  {
    this.severity = severity;
    this.status = status;
    this.conditionFilters = [];
    this.alertClauses = [];
  }
}