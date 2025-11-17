import { AlertClauseViewDto } from "./AlertClauseViewDto";
import { BaselinesVariablesViewDto } from "./BaselinesVariablesViewDto";
import { ConditionFilterViewDto } from "./ConditionFilterViewDto";

export class AlertConditionViewDto {
  id?: number;
  severity?: string;
  status: boolean = false;
  baselinesVariables?: BaselinesVariablesViewDto;
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