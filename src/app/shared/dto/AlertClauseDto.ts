import { AlertFiltersDto } from "./AlertFiltersDto";

export class AlertClauseDto 
{
  constructor(
    public id: number | null,
    public indicatorName: string,
    public startBrackets: number | null,
    public compOperation: string,
    public threshold: number,
    public endBrackets: number | null,
    public order: number | null,
    public externalOperation: string | null,
    public thresholdInclude: boolean | null,
    public thresholdUp: number | null,
    public thresholdIncludeUp: boolean | null,
    public conditionFilters: AlertFiltersDto[] = []
  ) {}
}