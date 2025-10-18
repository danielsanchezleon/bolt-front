import { AlertClauseDto } from "./AlertClauseDto";

export class AlertConditionDto 
{
  constructor(
    public id: number | null,
    public severity: string,
    public status: boolean,
    public alertClauses: AlertClauseDto[] = []
  ) {}
}