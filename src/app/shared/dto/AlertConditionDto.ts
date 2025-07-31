import { AlertClauseDto } from "./AlertClauseDto";
import { ConditionFilterDto } from "./ConditionFilterDto";

export class AlertConditionDto 
{
  constructor(
    public severity: number,
    public status: boolean,
    public clauses: AlertClauseDto[] = [],
    public filters: ConditionFilterDto[] = []
  ) {}
}