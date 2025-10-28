import { AlertClauseDto } from "./AlertClauseDto";
import { ConditionFilterDto } from "./ConditionFilterDto";

export class AlertConditionDto 
{
  constructor(
    public id: number | null,
    public severity: string,
    public status: boolean,
    public alertClauses: AlertClauseDto[] = [],
    public conditionFilters: ConditionFilterDto[] = []
  ) {}
}