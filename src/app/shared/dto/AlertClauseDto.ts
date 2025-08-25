export class AlertClauseDto 
{
  constructor(
    public startBrackets: number | null,
    public compOperation: number,
    public threshold: number,
    public endBrackets: number | null,
    public order: number | null,
    public externalOperation: string | null,
    public threshold_include: number | null,
    public threshold_up: number | null,
    public threshold_include_up: number | null
  ) {}
}