import { AlertClauseDto } from "./AlertClauseDto";
import { BaselinesVariablesDto } from "./BaselinesVariablesDto";
import { ConditionFilterDto } from "./ConditionFilterDto";

export class AlertConditionDto 
{
  constructor(
    public id: number | null,
    public severity: string,
    public status: boolean,
    public baselinesVariables: BaselinesVariablesDto,
    public alertClauses: AlertClauseDto[] = [],
    public conditionFilters: ConditionFilterDto[] = []
  ) {}
}