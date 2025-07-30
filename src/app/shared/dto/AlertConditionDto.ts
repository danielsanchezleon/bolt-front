import { AlertClauseDto } from "./AlertClauseDto";
import { ConditionFilterDto } from "./ConditionFilterDto";

export class AlertConditionDto 
{
  constructor(
    public severity: number,
    public clauses: AlertClauseDto[] = [],
    public filters: ConditionFilterDto[] = []
  ) {}
}